import { redirect } from "next/navigation";
import {
  hasAuthCookies,
  loginPathWithNext,
} from "@/lib/auth";
import { getServerSession } from "@/lib/auth-server";
import type { SessionUser } from "@/lib/session";

/**
 * Mock module RSC guard.
 * - No cookies → bootstrap (may restore from localStorage).
 * - Cookies but no user → render page (client BFF); avoid bootstrap loop.
 */
export async function guardMockModulePage(
  cookieHeader: string,
  returnPath: string,
): Promise<{ user: SessionUser | null; cookieHeader: string }> {
  const auth = await getServerSession(cookieHeader);
  if (auth.user) return auth;

  if (!hasAuthCookies(cookieHeader)) {
    redirect(loginPathWithNext(returnPath));
  }

  return auth;
}
