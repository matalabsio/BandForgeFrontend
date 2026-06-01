import { headers } from "next/headers";

/** Pathname set by middleware for BandForge app layout redirects. */
export async function getBandforgePathname(): Promise<string> {
  const h = await headers();
  const pathname = h.get("x-pathname");
  if (pathname?.startsWith("/")) return pathname;
  return "/dashboard";
}

export function bandforgeHideShellHeader(pathname: string): boolean {
  return pathname === "/dashboard" || pathname === "/scores";
}
