import { GUEST_USER } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";
import {
  getCachedCookieHeader,
  getCachedServerUser,
} from "@/lib/server-cache";
import type { AuthUser } from "@/lib/session";

/** Logged-in user on marketing pages (server cookies / refresh). */
export async function getMarketingSessionUser(): Promise<AuthUser | null> {
  if (!isAuthEnabled()) return null;
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);
  if (!user || user.id === GUEST_USER.id) return null;
  return user;
}
