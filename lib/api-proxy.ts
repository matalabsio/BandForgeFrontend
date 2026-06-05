import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import type { AuthResponse } from "@/lib/auth";
import { logAuthMetric } from "@/lib/auth-metrics";
import { applyAuthCookiesToResponse, DEFAULT_MAX_AGE } from "@/lib/auth-cookies";
import { refreshAuthSession } from "@/lib/auth-server";
import { accessTokenExpired } from "@/lib/jwt-expiry";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

function parseBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  return token || null;
}

/** Prefer httpOnly cookie access when the client sent an expired bearer. */
function shouldPreferCookieAccess(
  cookieHeader: string,
  authorization: string | null,
): boolean {
  const cookieAccess = readCookieHeader(cookieHeader, ACCESS_COOKIE);
  const clientBearer = parseBearerToken(authorization);
  if (!cookieAccess || !clientBearer) return false;
  return accessTokenExpired(clientBearer) && !accessTokenExpired(cookieAccess);
}

/** Read a cookie value from the raw Cookie request header (Route Handlers). */
export function readCookieHeader(cookieHeader: string, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

function hasRefreshCookie(cookieHeader: string): boolean {
  return Boolean(readCookieHeader(cookieHeader, REFRESH_COOKIE));
}

function buildProxyHeaders(
  cookieHeader: string,
  authorization: string | null,
  options?: { contentType?: string; preferCookieAccess?: boolean },
): Record<string, string> {
  const access = readCookieHeader(cookieHeader, ACCESS_COOKIE);
  const headers: Record<string, string> = { cookie: cookieHeader };
  const preferCookie =
    Boolean(options?.preferCookieAccess && access) ||
    shouldPreferCookieAccess(cookieHeader, authorization);

  if (preferCookie && access) {
    headers.Authorization = `Bearer ${access}`;
  } else if (authorization) {
    headers.Authorization = authorization;
  } else if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  if (options?.contentType) {
    headers["Content-Type"] = options.contentType;
  }

  return headers;
}

async function fetchBackend(
  backend: string,
  req: Request,
  cookieHeader: string,
  body: string | undefined,
  preferCookieAccess: boolean,
): Promise<Response> {
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const contentType = hasBody
    ? (req.headers.get("content-type") ?? "application/json")
    : undefined;

  return fetch(backend, {
    method: req.method,
    headers: buildProxyHeaders(cookieHeader, req.headers.get("authorization"), {
      contentType,
      preferCookieAccess,
    }),
    cache: "no-store",
    body: hasBody ? body : undefined,
  });
}

export async function proxyToBackend(
  req: Request,
  backendPath: string,
): Promise<NextResponse> {
  const startedAt = Date.now();
  const url = new URL(req.url);
  const backend = `${getApiUrl()}${backendPath.startsWith("/") ? backendPath : `/${backendPath}`}${url.search}`;
  let cookieHeader = req.headers.get("cookie") ?? "";
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;

  let authRefreshCookies: string[] | null = null;
  let refreshAuth: AuthResponse | null = null;

  let res: Response;
  try {
    res = await fetchBackend(backend, req, cookieHeader, body, false);
  } catch {
    console.info(
      JSON.stringify({
        route: backendPath,
        duration_ms: Date.now() - startedAt,
        cache_hit: false,
        cache_layer: "none",
        status: 503,
      }),
    );
    return NextResponse.json(
      {
        detail:
          "Cannot reach the API. Start the backend: uvicorn app.main:app --reload --host 127.0.0.1 --port 8000",
      },
      { status: 503 },
    );
  }

  if (res.status === 401 && hasRefreshCookie(cookieHeader)) {
    const refreshed = await refreshAuthSession(cookieHeader);
    if (refreshed) {
      cookieHeader = refreshed.cookieHeader;
      authRefreshCookies = refreshed.setCookieHeaders;
      refreshAuth = refreshed.auth;
      try {
        res = await fetchBackend(backend, req, cookieHeader, body, true);
        logAuthMetric(res.ok ? "proxy_retry_success" : "proxy_retry_failure", {
          route: backendPath,
          status: res.status,
        });
      } catch {
        logAuthMetric("proxy_retry_failure", {
          route: backendPath,
          reason: "backend_unreachable",
        });
        console.info(
          JSON.stringify({
            route: backendPath,
            duration_ms: Date.now() - startedAt,
            cache_hit: false,
            cache_layer: "none",
            status: 503,
            auth_refresh: true,
          }),
        );
        return NextResponse.json(
          {
            detail:
              "Cannot reach the API. Start the backend: uvicorn app.main:app --reload --host 127.0.0.1 --port 8000",
          },
          { status: 503 },
        );
      }
    } else {
      logAuthMetric("proxy_retry_failure", {
        route: backendPath,
        reason: "refresh_failed",
      });
    }
  }

  const responseBody = await res.text();
  console.info(
    JSON.stringify({
      route: backendPath,
      duration_ms: Date.now() - startedAt,
      cache_hit: false,
      cache_layer: "none",
      status: res.status,
      auth_refresh: Boolean(refreshAuth),
    }),
  );

  const response = new NextResponse(responseBody, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });

  if (refreshAuth) {
    if (authRefreshCookies?.length) {
      applyAuthCookiesToResponse(response, authRefreshCookies);
    }
    const secure = process.env.NODE_ENV === "production";
    if (refreshAuth.access_token) {
      response.cookies.set(ACCESS_COOKIE, refreshAuth.access_token, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: DEFAULT_MAX_AGE[ACCESS_COOKIE],
      });
    }
    if (refreshAuth.refresh_token) {
      response.cookies.set(REFRESH_COOKIE, refreshAuth.refresh_token, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: DEFAULT_MAX_AGE[REFRESH_COOKIE],
      });
    }
  }

  return response;
}
