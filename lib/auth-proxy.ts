import { NextResponse } from "next/server";
import {
  applyAuthCookiesToResponse,
  collectSetCookieHeaders,
  DEFAULT_MAX_AGE,
} from "@/lib/auth-cookies";
import { getApiUrl, type ApiErrorBody } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

const AUTH_PATHS = new Set([
  "register",
  "collect-lead",
  "login",
  "send-otp",
  "verify-otp",
  "verify-email",
  "refresh",
  "restore",
  "logout",
  "forgot-password",
  "reset-password",
  "me",
  "profile",
  "profile/avatar",
]);

function isAuthPath(path: string): boolean {
  return AUTH_PATHS.has(path);
}

export async function proxyAuthRequest(
  req: Request,
  pathSegments: string[],
): Promise<NextResponse> {
  const path = pathSegments.join("/");
  if (!isAuthPath(path)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const backendUrl = `${getApiUrl()}/auth/${path}`;
  const cookieHeader = req.headers.get("cookie") ?? "";

  const contentType = req.headers.get("content-type") ?? "";
  const authorization = req.headers.get("authorization");
  const headers: Record<string, string> = { cookie: cookieHeader };
  if (authorization) {
    headers.Authorization = authorization;
  }
  if (contentType) {
    headers["Content-Type"] = contentType;
  } else if (req.method !== "GET" && req.method !== "HEAD") {
    headers["Content-Type"] = "application/json";
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType.includes("multipart/form-data")) {
      init.body = await req.arrayBuffer();
    } else {
      init.body = await req.text();
    }
  }

  const backendRes = await fetchWithTimeout(backendUrl, {
    ...init,
    timeoutMs: 10_000,
  });
  const body = await backendRes.text();
  const res = new NextResponse(body, {
    status: backendRes.status,
    headers: {
      "Content-Type":
        backendRes.headers.get("content-type") ?? "application/json",
    },
  });

  applyAuthCookiesToResponse(res, collectSetCookieHeaders(backendRes.headers));

  if (
    backendRes.ok &&
    (path === "refresh" ||
      path === "restore" ||
      path === "login" ||
      path === "verify-otp" ||
      path === "verify-email")
  ) {
    try {
      const parsed = JSON.parse(body) as {
        access_token?: string;
        refresh_token?: string | null;
      };
      const secure = process.env.NODE_ENV === "production";
      if (parsed.access_token) {
        res.cookies.set(ACCESS_COOKIE, parsed.access_token, {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: DEFAULT_MAX_AGE[ACCESS_COOKIE],
        });
      }
      if (parsed.refresh_token) {
        res.cookies.set(REFRESH_COOKIE, parsed.refresh_token, {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: DEFAULT_MAX_AGE[REFRESH_COOKIE],
        });
      }
    } catch {
      /* body may not be JSON */
    }
  }

  if (path === "logout") {
    const secure = process.env.NODE_ENV === "production";
    res.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
    res.cookies.set(REFRESH_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      secure,
      sameSite: "lax",
    });
  }

  return res;
}

export async function proxyAuthJson<T>(
  req: Request,
  pathSegments: string[],
): Promise<{ response: NextResponse; data: T | ApiErrorBody }> {
  const proxied = await proxyAuthRequest(req, pathSegments);
  const data = (await proxied.json()) as T | ApiErrorBody;
  return { response: proxied, data };
}
