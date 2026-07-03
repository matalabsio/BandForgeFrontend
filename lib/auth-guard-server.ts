import { redirect } from "next/navigation";
import { resolveAuthRedirectPath } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";
import { GUEST_SESSION, GUEST_USER, type SessionUser } from "@/lib/session";

/** Vercel production build without real auth (guest mode). */
export function isProductionAuthMisconfigured(): boolean {
  return process.env.VERCEL === "1" && !isAuthEnabled();
}

export function isGuestOrMissingUser(user: { id: string } | null): boolean {
  return !user || user.id === GUEST_USER.id;
}

/** Protected RSC pages: require a real session when auth is enabled. */
export function redirectIfUnauthenticated(
  user: { id: string } | null,
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
