import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppAuthShell } from "@/components/bandforge/app-auth-shell";
import { DashboardSidebarNav } from "@/components/bandforge/dashboard/dashboard-sidebar-nav";
import { DashboardShell } from "@/components/bandforge/dashboard/dashboard-shell";
import { AppFontsShell } from "@/components/fonts/app-fonts-shell";
import {
  bandforgeHideShellHeader,
  bandforgeQuietCheckoutChrome,
  getBandforgePathname,
} from "@/lib/bandforge-pathname";
import { authGuardRedirectPath } from "@/lib/auth";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { fetchSubscriptionResult } from "@/lib/payments-server";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";
import { formatUserDisplayName } from "@/lib/user-display";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BandforgeAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cookieHeader, pathname] = await Promise.all([
    getCachedCookieHeader(),
    getBandforgePathname(),
  ]);

  const [user, subResult] = await Promise.all([
    getCachedServerSession(cookieHeader),
    fetchSubscriptionResult(cookieHeader),
  ]);
  if (!user) {
    redirect(authGuardRedirectPath(pathname, cookieHeader));
  }

  const quietChrome = bandforgeQuietCheckoutChrome(pathname);
  const hideHeader = bandforgeHideShellHeader(pathname) || quietChrome;
  const shellDisplayName = formatUserDisplayName(user);
  const shellAvatarUrl = user.avatar_display_url ?? null;
  const showPremiumCta =
    subResult.known && !hasFullSkillProgram(subResult.subscription);

  return (
    <AppFontsShell>
      <AppAuthShell serverAuthenticated>
        <DashboardShell
          displayName={shellDisplayName}
          avatarUrl={shellAvatarUrl}
          pathname={pathname}
          hideHeader={hideHeader}
          hideChrome={quietChrome}
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
