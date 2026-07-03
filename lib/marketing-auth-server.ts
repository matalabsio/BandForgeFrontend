import { GUEST_USER } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";
import type { SessionUser } from "@/lib/session";

/** Logged-in user on marketing pages (server cookies / refresh). */
export async function getMarketingSessionUser(): Promise<SessionUser | null> {
  if (!isAuthEnabled()) return null;
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  if (!user || user.id === GUEST_USER.id) return null;
  return user;
}
