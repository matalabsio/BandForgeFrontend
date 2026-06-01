import { authBootstrapPath } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";

/** Fast sign-in page — avoids ?start=1 conversion shell compile in dev. */
export function marketingSignInHref(next = "/dashboard"): string {
  if (!isAuthEnabled()) return "/dashboard";
  const q = encodeURIComponent(next);
  return `/login?next=${q}`;
}

/** Protected destination — restores JWT from localStorage into cookies before app routes. */
export function marketingAppHref(next = "/dashboard"): string {
  if (!isAuthEnabled()) return next;
  return authBootstrapPath(next);
}

