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

/** Focused receipt page — no dashboard chrome. */
export function bandforgeQuietCheckoutChrome(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return path === "/checkout/success";
}

/** Bank speaking exercise uses the same full-bleed chrome as /test speaking. */
export function bandforgeQuietSpeakingExerciseChrome(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return /\/practice\/speaking\/[^/]+\/exercise\/?$/.test(path);
}
