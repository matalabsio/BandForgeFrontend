import { redirect } from "next/navigation";
import { authBootstrapPath } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";
import { GUEST_USER, type AuthUser } from "@/lib/session";

/** Vercel production build without real auth (guest mode). */
export function isProductionAuthMisconfigured(): boolean {
  return process.env.VERCEL === "1" && !isAuthEnabled();
}

export function isGuestOrMissingUser(user: AuthUser | null): boolean {
  return !user || user.id === GUEST_USER.id;
}

/** Protected RSC pages: require a real session when auth is enabled. */
export function redirectIfUnauthenticated(
  user: AuthUser | null,
  nextPath: string,
): void {
  if (!isAuthEnabled()) return;
  if (isGuestOrMissingUser(user)) {
    redirect(authBootstrapPath(nextPath));
  }
}

/** After redirectIfUnauthenticated — safe user for RSC (guest only when auth disabled in dev). */
export function resolveSessionUser(user: AuthUser | null): AuthUser {
  return user ?? GUEST_USER;
}
