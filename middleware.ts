import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginPathWithNext } from "@/lib/auth";
import { middlewareRefreshAuth } from "@/lib/auth-middleware-refresh";
import { bootstrapNextPath } from "@/lib/bootstrap-next-path";
import { isAuthEnabled } from "@/lib/flags";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

function continueWithPathname(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("x-pathname", pathname);
  return response;
}

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/scores",
  "/profile",
  "/mock",
  "/test",
  "/study-plan",
  "/practice",
  "/diagnostic/report",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAuthEnabled()) {
    return continueWithPathname(request, pathname);
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
    const next = bootstrapNextPath(pathname, request.nextUrl.search);
    return NextResponse.redirect(
      new URL(loginPathWithNext(next), request.url),
    );
  }

  const refreshed = await middlewareRefreshAuth(request, pathname);
  if (refreshed) {
    return refreshed;
  }

  return continueWithPathname(request, pathname);
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
    "/study-plan",
    "/study-plan/:path*",
    "/practice",
    "/practice/:path*",
    "/diagnostic/report",
  ],
};
