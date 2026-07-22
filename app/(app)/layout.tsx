import { redirect } from "next/navigation";
import { AppAuthShell } from "@/components/bandforge/app-auth-shell";
import { DashboardSidebarNav } from "@/components/bandforge/dashboard/dashboard-sidebar-nav";
import { DashboardShell } from "@/components/bandforge/dashboard/dashboard-shell";
import { AppFontsShell } from "@/components/fonts/app-fonts-shell";
import {
  bandforgeHideShellHeader,
  getBandforgePathname,
} from "@/lib/bandforge-pathname";
import { authGuardRedirectPath } from "@/lib/auth";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { fetchSubscription } from "@/lib/payments-server";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";
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

  const [user, subscription] = await Promise.all([
    getCachedServerSession(cookieHeader),
    fetchSubscription(cookieHeader),
  ]);
  if (!user) {
    redirect(authGuardRedirectPath(pathname, cookieHeader));
  }

  const hideHeader = bandforgeHideShellHeader(pathname);
  const shellDisplayName = hideHeader
    ? "Account"
    : formatUserDisplayName(user);
  const shellAvatarUrl = hideHeader ? null : (user.avatar_display_url ?? null);
  const showPremiumCta = !hasFullSkillProgram(subscription);

  return (
    <AppFontsShell>
      <AppAuthShell serverAuthenticated>
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
              showPremiumCta={showPremiumCta}
            />
          }
        >
          {children}
        </DashboardShell>
      </AppAuthShell>
    </AppFontsShell>
  );
}
