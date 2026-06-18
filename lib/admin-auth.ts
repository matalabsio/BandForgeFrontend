import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import {
  adminLoginPath,
  isAdminEmailAllowed,
  isAdminRole,
} from "@/lib/admin-roles";
import { getCachedCookieHeader } from "@/lib/server-cache";

export { adminLoginPath, isAdminRole } from "@/lib/admin-roles";

export async function requireAdminSession(nextPath = "/admin") {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getServerUser(cookieHeader);

  if (!user) {
    redirect(adminLoginPath(nextPath));
  }

  if (
    !user.is_active ||
    !isAdminRole(user.role) ||
    !isAdminEmailAllowed(user.email)
  ) {
    redirect(adminLoginPath(nextPath, "access_denied"));
  }

  return user;
}
