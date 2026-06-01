import { redirect } from "next/navigation";
import { authBootstrapPath, hasAuthCookies } from "@/lib/auth";
import { getServerAuth } from "@/lib/auth-server";
import type { AuthUser } from "@/lib/session";

/**
 * Mock module RSC guard.
 * - No cookies → bootstrap (may restore from localStorage).
 * - Cookies but no user → render page (client BFF); avoid bootstrap loop.
 */
export async function guardMockModulePage(
  cookieHeader: string,
  returnPath: string,
): Promise<{ user: AuthUser | null; cookieHeader: string }> {
  const auth = await getServerAuth(cookieHeader);
  if (auth.user) return auth;

  if (!hasAuthCookies(cookieHeader)) {
    redirect(authBootstrapPath(returnPath));
  }

  return auth;
}
