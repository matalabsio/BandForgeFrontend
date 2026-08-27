import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProductionAuthConfigError } from "@/components/auth/production-auth-config-error";
import { DashboardGate } from "@/components/bandforge/dashboard/dashboard-gate";
import { DashboardProfileSync } from "@/components/bandforge/dashboard/dashboard-profile-sync";
import { DashboardContentSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";
import { DashboardPersonalizedSection } from "@/components/bandforge/dashboard/sections/dashboard-personalized-section";
import { DashboardTopHeader } from "@/components/bandforge/dashboard/dashboard-top-header";
import { DashboardUnlockGate } from "@/components/bandforge/dashboard/dashboard-plan-activating";
import {
  isProductionAuthMisconfigured,
  redirectIfUnauthenticated,
  resolveSessionUser,
} from "@/lib/auth-guard-server";
import {
  hasFullSkillProgram,
  hasSpeakingSkillPlan,
  hasWritingSkillPlan,
  isDiagnosticComplete,
  SPEAKING_PRACTICE_PATH,
  WRITING_PRACTICE_PATH,
} from "@/lib/entitlement";
import {
  emptyLearningProfile,
  fetchLearningProfile,
} from "@/lib/learning-server";
import { fetchSubscriptionResult } from "@/lib/payments-server";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";
import {
  formatUserDisplayName,
  getUserFirstName,
} from "@/lib/user-display";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard · BandForge",
};

type UserProps = {
  firstName: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  ieltsPurpose: string | null;
  ieltsGoal: string | null;
};

type DashboardBodyProps = {
  cookieHeader: string;
  user: UserProps;
  userId: string;
};

async function DashboardBody({ cookieHeader, user, userId }: DashboardBodyProps) {
  const [subResult, learning] = await Promise.all([
    fetchSubscriptionResult(cookieHeader),
    fetchLearningProfile(cookieHeader),
  ]);
  const subscription = subResult.subscription;
  const profile = learning ?? emptyLearningProfile(userId);

  // Skill-pack buyers skip the FSP paywall and land on their course home.
  if (!hasFullSkillProgram(subscription)) {
    if (hasSpeakingSkillPlan(subscription)) {
      redirect(SPEAKING_PRACTICE_PATH);
    }
    if (hasWritingSkillPlan(subscription)) {
      redirect(WRITING_PRACTICE_PATH);
    }
    // Stay on dashboard: unpaid users see the plan paywall (start vs unlock).
    // Post-login continue routes unpaid users into diagnostic/checkout instead.
    return (
      <>
        <DashboardTopHeader
          firstName={user.firstName}
          displayName={user.displayName}
          email={user.email}
          avatarUrl={user.avatarUrl}
          ieltsPurpose={user.ieltsPurpose}
          ieltsGoal={user.ieltsGoal}
          showReportButton={false}
        />
        <DashboardUnlockGate
          hasDiagnostic={isDiagnosticComplete(profile)}
          subscriptionUnknown={!subResult.known}
        />
      </>
    );
  }

  return (
    <DashboardGate learning={profile} subscription={subscription}>
      <DashboardPersonalizedSection
        learning={profile}
        user={user}
        userId={userId}
      />
    </DashboardGate>
  );
}

export default async function DashboardPage() {
  if (isProductionAuthMisconfigured()) {
    return <ProductionAuthConfigError />;
  }

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, "/dashboard", cookieHeader);
  const sessionUser = resolveSessionUser(user);

  const userProps: UserProps = {
    firstName: getUserFirstName(sessionUser),
    displayName: formatUserDisplayName(sessionUser),
    email: sessionUser.email,
    avatarUrl: sessionUser.avatar_display_url ?? null,
    ieltsPurpose: sessionUser.ielts_purpose ?? null,
    ieltsGoal: sessionUser.ielts_goal ?? null,
  };

  return (
    <>
      <DashboardProfileSync
        ieltsPurpose={userProps.ieltsPurpose}
        ieltsGoal={userProps.ieltsGoal}
      />
      <div className="space-y-6">
        <Suspense fallback={<DashboardContentSkeleton />}>
          <DashboardBody
            cookieHeader={cookieHeader}
            user={userProps}
            userId={sessionUser.id}
          />
        </Suspense>
      </div>
    </>
  );
}
