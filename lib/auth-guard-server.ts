import { redirect } from "next/navigation";
import { resolveAuthRedirectPath } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";
import { GUEST_SESSION, GUEST_USER, type SessionUser } from "@/lib/session";

/** Vercel production build without real auth (guest mode). */
export function isProductionAuthMisconfigured(): boolean {
  return process.env.VERCEL === "1" && !isAuthEnabled();
}

/**
 * True when there is no account-capable session for protected app routes.
 * Rejects: missing user, auth-disabled placeholder id, and real DB role=guest.
 * Student / admin / super_admin (any non-guest role) are account-capable.
 */
export function isGuestOrMissingUser(
  user: { id: string; role?: string | null } | null,
): boolean {
  return (
    !user ||
    user.id === GUEST_USER.id ||
    user.role === "guest"
  );
}

/** Protected RSC pages: require a full-account session when auth is enabled. */
export function redirectIfUnauthenticated(
  user: { id: string; role?: string | null } | null,
  nextPath: string,
  cookieHeader = "",
): void {
  if (!isAuthEnabled()) return;
  if (isGuestOrMissingUser(user)) {
    redirect(resolveAuthRedirectPath(nextPath, cookieHeader));
  }
}

/** After redirectIfUnauthenticated — safe session for RSC shell/header props. */
export function resolveSessionUser(user: SessionUser | null): SessionUser {
  return user ?? GUEST_SESSION;
}
