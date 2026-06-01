import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthEnabled } from "@/lib/flags";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/scores",
  "/profile",
  "/mock",
  "/test",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAuthEnabled()) {
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
    url.pathname = "/auth/bootstrap";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
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
  ],
};
