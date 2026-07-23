import { authBootstrapPath } from "@/lib/auth";
import { hasSessionHintCookie } from "@/lib/session";

/**
 * Build-time auth flag only — do not read runtime `AUTH_ENABLED` here.
 * Marketing chrome must stay statically prerenderable (ISR / force-static).
 */
function isMarketingAuthEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_AUTH_ENABLED?.trim() ?? "";
  if (flag.toLowerCase() === "true") return true;
  // Recover when NEXT_PUBLIC_AUTH_ENABLED was set to an API URL by mistake.
  return flag.startsWith("http://") || flag.startsWith("https://");
}

/** Fast sign-in page — avoids ?start=1 conversion shell compile in dev. */
export function marketingSignInHref(next = "/dashboard"): string {
  if (!isMarketingAuthEnabled()) return "/dashboard";
  const q = encodeURIComponent(next);
  return `/login?next=${q}`;
}

/** Protected destination — sign in first; login escalates to bootstrap when localStorage has a refresh token. */
export function marketingAppHref(next = "/dashboard"): string {
  if (!isMarketingAuthEnabled()) return next;
  return marketingSignInHref(next);
}

/** Client: direct to app when session hint is set; otherwise restore via bootstrap. */
export function clientPostAuthDestination(nextPath = "/dashboard"): string {
  if (typeof document === "undefined") {
    return authBootstrapPath(nextPath);
  }
  if (hasSessionHintCookie()) {
    return nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";
  }
  return authBootstrapPath(nextPath);
}
