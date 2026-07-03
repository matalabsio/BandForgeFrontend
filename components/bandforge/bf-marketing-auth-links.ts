import { authBootstrapPath } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

/** Fast sign-in page — avoids ?start=1 conversion shell compile in dev. */
export function marketingSignInHref(next = "/dashboard"): string {
  if (!isAuthEnabled()) return "/dashboard";
  const q = encodeURIComponent(next);
  return `/login?next=${q}`;
}

/** Protected destination — sign in first; login escalates to bootstrap when localStorage has a refresh token. */
export function marketingAppHref(next = "/dashboard"): string {
  if (!isAuthEnabled()) return next;
  return marketingSignInHref(next);
}

/** Client: direct to app when cookies are set; otherwise restore via bootstrap. */
export function clientPostAuthDestination(nextPath = "/dashboard"): string {
  if (typeof document === "undefined") {
    return authBootstrapPath(nextPath);
  }
  const hasCookie = document.cookie.split(";").some((c) => {
    const name = c.trim().split("=")[0];
    return name === ACCESS_COOKIE || name === REFRESH_COOKIE;
  });
  if (hasCookie) {
    return nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";
  }
  return authBootstrapPath(nextPath);
}
