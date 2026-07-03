import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginPathWithNext } from "@/lib/auth";
import { middlewareRefreshAuth } from "@/lib/auth-middleware-refresh";
import { bootstrapNextPath } from "@/lib/bootstrap-next-path";
import { isAuthEnabled } from "@/lib/flags";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/scores",
  "/profile",
  "/mock",
  "/test",
  "/admin",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAuthEnabled()) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }
  
 // Admin login uses email/password on this page — no session cookie required yet. 
  if (pathname === "/admin/login") {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasCookie = Boolean(
    request.cookies.get(REFRESH_COOKIE)?.value ||
      request.cookies.get(ACCESS_COOKIE)?.value,
  );

  if (!hasCookie) {
    const url = request.nextUrl.clone();
    const isAdminPanel =
      pathname === "/admin" || pathname.startsWith("/admin/");
    if (isAdminPanel) {
      url.pathname = "/admin/login";
      url.searchParams.set("next", "/admin");
    } else {
      const next = bootstrapNextPath(pathname, request.nextUrl.search);
      return NextResponse.redirect(
        new URL(loginPathWithNext(next), request.url),
      );
    }
    return NextResponse.redirect(url);
  }

  const refreshed = await middlewareRefreshAuth(request);
  if (refreshed) {
    refreshed.headers.set("x-pathname", pathname);
    return refreshed;
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/scores",
    "/scores/:path*",
    "/profile",
    "/profile/:path*",
    "/mock",
    "/mock/:path*",
    "/test",
    "/test/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
