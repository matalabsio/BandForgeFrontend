import { NextResponse } from "next/server";
import { getApiUrl, type ApiErrorBody } from "@/lib/api";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

const AUTH_PATHS = new Set([
  "register",
  "collect-lead",
  "login",
  "send-otp",
  "verify-otp",
  "verify-email",
  "refresh",
  "logout",
  "forgot-password",
  "reset-password",
  "me",
]);

function rewriteSetCookie(header: string): string {
  return header
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*Path=[^;]*/gi, "")
    .concat("; Path=/");
}

export async function proxyAuthRequest(
  req: Request,
  pathSegments: string[],
): Promise<NextResponse> {
  const path = pathSegments.join("/");
  if (!AUTH_PATHS.has(path)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const backendUrl = `${getApiUrl()}/auth/${path}`;
  const cookieHeader = req.headers.get("cookie") ?? "";

  const init: RequestInit = {
    method: req.method,
    headers: {
      cookie: cookieHeader,
      "Content-Type": req.headers.get("content-type") ?? "application/json",
    },
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const backendRes = await fetch(backendUrl, init);
  const body = await backendRes.text();
  const res = new NextResponse(body, {
    status: backendRes.status,
    headers: {
      "Content-Type":
        backendRes.headers.get("content-type") ?? "application/json",
    },
  });

  const setCookies =
    typeof backendRes.headers.getSetCookie === "function"
      ? backendRes.headers.getSetCookie()
      : [];

  if (setCookies.length === 0) {
    const single = backendRes.headers.get("set-cookie");
    if (single) setCookies.push(single);
  }

  for (const raw of setCookies) {
    res.headers.append("Set-Cookie", rewriteSetCookie(raw));
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
