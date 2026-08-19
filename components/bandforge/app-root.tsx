"use client";

import { usePathname } from "next/navigation";
import { BfAuthSessionRoot } from "@/components/bandforge/bf-auth-session-root";
import { BfMarketingRoot } from "@/components/bandforge/bf-marketing-root";
import { ScrollToTopOnNavigate } from "@/components/bandforge/scroll-to-top-on-navigate";

/** App routes skip marketing auth shell (session modals, duplicate /api/auth calls). */
const APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/scores",
  "/profile",
  "/mock",
  "/test",
  "/diagnostic",
  "/auth",
] as const;

/** Auth UI routes need session provider but not conversion modals. */
const AUTH_SESSION_ROUTE_PREFIXES = [
  "/login",
  "/signup",
  "/verify-phone",
  "/verify-email-otp",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/check-email",
] as const;

function matchesPrefix(
  pathname: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function AppRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shell = matchesPrefix(pathname, APP_ROUTE_PREFIXES) ? (
    <>{children}</>
  ) : matchesPrefix(pathname, AUTH_SESSION_ROUTE_PREFIXES) ? (
    <BfAuthSessionRoot>{children}</BfAuthSessionRoot>
  ) : (
    <BfMarketingRoot>{children}</BfMarketingRoot>
  );

  return (
    <>
      <ScrollToTopOnNavigate />
      {shell}
    </>
  );
}
