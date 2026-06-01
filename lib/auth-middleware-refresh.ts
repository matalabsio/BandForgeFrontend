import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import {
  applyAuthCookiesToResponse,
  collectSetCookieHeaders,
  DEFAULT_MAX_AGE,
} from "@/lib/auth-cookies";
import { accessTokenExpired } from "@/lib/auth-server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

/** Refresh access token before RSC when access is missing/expired but refresh cookie exists. */
export async function middlewareRefreshAuth(
  request: NextRequest,
): Promise<NextResponse | null> {
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;

  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (access && !accessTokenExpired(access)) return null;

  try {
    const res = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const response = NextResponse.next();
    applyAuthCookiesToResponse(response, collectSetCookieHeaders(res.headers));

    try {
      const data = (await res.clone().json()) as {
        access_token?: string;
        refresh_token?: string | null;
      };
      const secure = process.env.NODE_ENV === "production";
      if (data.access_token) {
        response.cookies.set(ACCESS_COOKIE, data.access_token, {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: DEFAULT_MAX_AGE[ACCESS_COOKIE],
        });
      }
      if (data.refresh_token) {
        response.cookies.set(REFRESH_COOKIE, data.refresh_token, {
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

    return response;
  } catch {
    return null;
  }
}
