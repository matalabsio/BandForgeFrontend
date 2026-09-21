import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppAuthShell } from "@/components/bandforge/app-auth-shell";
import { DashboardSidebarNav } from "@/components/bandforge/dashboard/dashboard-sidebar-nav";
import { DashboardShell } from "@/components/bandforge/dashboard/dashboard-shell";
import { AppFontsShell } from "@/components/fonts/app-fonts-shell";
import {
  bandforgeHideShellHeader,
  bandforgeQuietCheckoutChrome,
  bandforgeQuietListeningExerciseChrome,
  bandforgeQuietReadingExerciseChrome,
  bandforgeQuietSpeakingExerciseChrome,
  bandforgeQuietWritingExerciseChrome,
  getBandforgePathname,
} from "@/lib/bandforge-pathname";
import { authGuardRedirectPath } from "@/lib/auth";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import {
  isFullPracticePlanComplete,
  overallPlanPercent,
} from "@/lib/dashboard-plan-math";
import {
  canAccessPracticeSkill,
  hasDualBundlePlan,
  hasFullSkillProgram,
  isPackOnlyAccess,
  PRACTICE_PATH,
  SPEAKING_PRACTICE_PATH,
  WRITING_PRACTICE_PATH,
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
  // Full-account only: null, placeholder, and role=guest redirect when auth is on.
  // Auth-disabled mock keeps GUEST_SESSION (redirectIfUnauthenticated no-ops).
  redirectIfUnauthenticated(user, pathname, cookieHeader);
  if (!user) {
    redirect(authGuardRedirectPath(pathname, cookieHeader));
  }

  const practiceExamChrome =
    bandforgeQuietSpeakingExerciseChrome(pathname) ||
    bandforgeQuietWritingExerciseChrome(pathname) ||
    bandforgeQuietListeningExerciseChrome(pathname) ||
    bandforgeQuietReadingExerciseChrome(pathname);
  const quietChrome = bandforgeQuietCheckoutChrome(pathname) || practiceExamChrome;
  const hideHeader = bandforgeHideShellHeader(pathname) || quietChrome;
  const shellDisplayName = formatUserDisplayName(user);
  const shellAvatarUrl = user.avatar_display_url ?? null;
  const showPremiumCta =
    subResult.known && !hasFullSkillProgram(subResult.subscription);
  // Pack-only Writing/Speaking course tabs — hide for FSP (strict plan).
  const showWritingNav =
    canAccessPracticeSkill(subResult.subscription, "writing") &&
    !hasFullSkillProgram(subResult.subscription);
  const showSpeakingNav =
    canAccessPracticeSkill(subResult.subscription, "speaking") &&
    !hasFullSkillProgram(subResult.subscription);
  const mockUnlocked = isFullPracticePlanComplete(
    learning?.hub_progress,
    learning?.study_plan,
  );
  const isDualBundle =
    !hasFullSkillProgram(subResult.subscription) &&
    hasDualBundlePlan(subResult.subscription);
  const packOnly = isPackOnlyAccess(subResult.subscription);
  const homeHref = hasFullSkillProgram(subResult.subscription)
    ? "/dashboard"
    : isDualBundle
      ? PRACTICE_PATH
      : showWritingNav
        ? WRITING_PRACTICE_PATH
        : showSpeakingNav
          ? SPEAKING_PRACTICE_PATH
          : "/pricing";

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
          packOnly={packOnly}
          report={
            packOnly
              ? undefined
              : {
                  studentName: shellDisplayName,
                  tasks: learning?.todays_tasks ?? [],
                  hubProgress: learning?.hub_progress,
                  currentBand: learning?.current_band,
                  targetBand: learning?.target_band,
                  overallPlanPct: learning
                    ? overallPlanPercent(learning.study_plan)
                    : 0,
                }
          }
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
              packOnly={packOnly}
              homeHref={homeHref}
            />
          }
        >
          {children}
        </DashboardShell>
      </AppAuthShell>
    </AppFontsShell>
  );
}
