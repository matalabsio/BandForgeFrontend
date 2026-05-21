"use client";

import { usePathname } from "next/navigation";
import { BfConversionShell } from "@/components/bandforge/bf-conversion-shell";

/** App routes skip marketing auth shell (session modals, duplicate /api/auth calls). */
const APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/profile",
  "/workspace",
  "/settings",
  "/mock",
  "/admin",
  "/auth/bootstrap",
] as const;

function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function AppRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isAppRoute(pathname)) {
    return <>{children}</>;
  }
  return <BfConversionShell>{children}</BfConversionShell>;
}
