import { redirect } from "next/navigation";
import { AppAuthShell } from "@/components/bandforge/app-auth-shell";
import { DashboardSidebarNav } from "@/components/bandforge/dashboard/dashboard-sidebar-nav";
import { DashboardShell } from "@/components/bandforge/dashboard/dashboard-shell";
import {
  bandforgeHideShellHeader,
  getBandforgePathname,
} from "@/lib/bandforge-pathname";
import { authGuardRedirectPath } from "@/lib/auth";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { formatUserDisplayName } from "@/lib/user-display";

export const dynamic = "force-dynamic";

export default async function BandforgeAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cookieHeader, pathname] = await Promise.all([
    getCachedCookieHeader(),
    getBandforgePathname(),
  ]);

  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authGuardRedirectPath(pathname));
  }

  const hideHeader = bandforgeHideShellHeader(pathname);
  const shellDisplayName = hideHeader
    ? "Account"
    : formatUserDisplayName(user);
  const shellAvatarUrl = hideHeader ? null : (user.avatar_display_url ?? null);

  return (
    <AppAuthShell>
      <DashboardShell
        displayName={shellDisplayName}
        avatarUrl={shellAvatarUrl}
        pathname={pathname}
        hideHeader={hideHeader}
        sidebar={
          <DashboardSidebarNav
            pathname={pathname}
            displayName={formatUserDisplayName(user)}
            avatarUrl={user.avatar_display_url}
          />
        }
      >
        {children}
      </DashboardShell>
    </AppAuthShell>
  );
}
