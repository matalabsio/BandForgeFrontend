import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppAuthShell } from "@/components/bandforge/app-auth-shell";
import { DashboardSidebarNav } from "@/components/bandforge/dashboard/dashboard-sidebar-nav";
import { DashboardShell } from "@/components/bandforge/dashboard/dashboard-shell";
import { AppFontsShell } from "@/components/fonts/app-fonts-shell";
import {
  bandforgeHideShellHeader,
  bandforgeQuietCheckoutChrome,
  bandforgeQuietSpeakingExerciseChrome,
  bandforgeQuietWritingExerciseChrome,
  getBandforgePathname,
} from "@/lib/bandforge-pathname";
import { authGuardRedirectPath } from "@/lib/auth";
import {
  isFullPracticePlanComplete,
  overallPlanPercent,
} from "@/lib/dashboard-plan-math";
import {
  canAccessPracticeSkill,
  hasDualBundlePlan,
  hasFullSkillProgram,
} from "@/lib/entitlement";
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

  const practiceExamChrome =
    bandforgeQuietSpeakingExerciseChrome(pathname) ||
    bandforgeQuietWritingExerciseChrome(pathname);
  const quietChrome = bandforgeQuietCheckoutChrome(pathname) || practiceExamChrome;
  const hideHeader = bandforgeHideShellHeader(pathname) || quietChrome;
  const shellDisplayName = formatUserDisplayName(user);
  const shellAvatarUrl = user.avatar_display_url ?? null;
  const showPremiumCta =
    subResult.known && !hasFullSkillProgram(subResult.subscription);
  const showWritingNav = canAccessPracticeSkill(
    subResult.subscription,
    "writing",
  );
  const showSpeakingNav = canAccessPracticeSkill(
    subResult.subscription,
    "speaking",
  );
  const mockUnlocked = isFullPracticePlanComplete(
    learning?.hub_progress,
    learning?.study_plan,
  );
  const isDualBundle =
    !hasFullSkillProgram(subResult.subscription) &&
    hasDualBundlePlan(subResult.subscription);

  return (
    <AppFontsShell>
      <AppAuthShell serverAuthenticated>
        <DashboardShell
          displayName={shellDisplayName}
          avatarUrl={shellAvatarUrl}
          pathname={pathname}
          hideHeader={hideHeader}
          hideChrome={quietChrome}
          fullBleed={practiceExamChrome}
          showWritingNav={showWritingNav}
          showSpeakingNav={showSpeakingNav}
          report={{
            studentName: shellDisplayName,
            tasks: learning?.todays_tasks ?? [],
            hubProgress: learning?.hub_progress,
            currentBand: learning?.current_band,
            targetBand: learning?.target_band,
            overallPlanPct: learning
              ? overallPlanPercent(learning.study_plan)
              : 0,
          }}
          sidebar={
            <DashboardSidebarNav
              pathname={pathname}
              displayName={formatUserDisplayName(user)}
              avatarUrl={user.avatar_display_url}
              showPremiumCta={showPremiumCta}
              mockUnlocked={mockUnlocked}
              showWritingNav={showWritingNav}
              showSpeakingNav={showSpeakingNav}
              isDualBundle={isDualBundle}
            />
          }
        >
          {children}
        </DashboardShell>
      </AppAuthShell>
    </AppFontsShell>
  );
}
