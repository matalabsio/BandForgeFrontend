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
import { isFullPracticePlanComplete } from "@/lib/dashboard-plan-math";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { fetchLearningProfile } from "@/lib/learning-server";
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

  const [user, subResult, learning] = await Promise.all([
    getCachedServerSession(cookieHeader),
    fetchSubscriptionResult(cookieHeader),
    fetchLearningProfile(cookieHeader),
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
  const mockUnlocked = isFullPracticePlanComplete(
    learning?.hub_progress,
    learning?.study_plan,
  );

  return (
    <AppFontsShell>
      <AppAuthShell serverAuthenticated>
        <DashboardShell
          displayName={shellDisplayName}
          avatarUrl={shellAvatarUrl}
          pathname={pathname}
          hideHeader={hideHeader}
          hideChrome={quietChrome}
          mockUnlocked={mockUnlocked}
          sidebar={
            <DashboardSidebarNav
              pathname={pathname}
              displayName={formatUserDisplayName(user)}
              avatarUrl={user.avatar_display_url}
              showPremiumCta={showPremiumCta}
              mockUnlocked={mockUnlocked}
            />
          }
        >
          {children}
        </DashboardShell>
      </AppAuthShell>
    </AppFontsShell>
  );
}
