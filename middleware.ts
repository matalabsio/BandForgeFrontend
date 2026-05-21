import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthEnabled } from "@/lib/flags";
import { REFRESH_COOKIE } from "@/lib/session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/workspace",
  "/settings",
  "/profile",
  "/mock",
  "/test",
];

export function middleware(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/bootstrap";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/workspace",
    "/workspace/:path*",
    "/settings",
    "/settings/:path*",
    "/profile",
    "/profile/:path*",
    "/mock",
    "/mock/:path*",
    "/test",
    "/test/:path*",
  ],
};
