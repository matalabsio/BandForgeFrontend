import { Suspense } from "react";
import { ProductionAuthConfigError } from "@/components/auth/production-auth-config-error";
import { DashboardGate } from "@/components/bandforge/dashboard/dashboard-gate";
import { DashboardProfileSync } from "@/components/bandforge/dashboard/dashboard-profile-sync";
import { DashboardContentSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";
import { DashboardPersonalizedSection } from "@/components/bandforge/dashboard/sections/dashboard-personalized-section";
import { DashboardTopHeader } from "@/components/bandforge/dashboard/dashboard-top-header";
import { DashboardPlanPaywall } from "@/components/bandforge/dashboard/dashboard-plan-paywall";
import {
  isProductionAuthMisconfigured,
  redirectIfUnauthenticated,
  resolveSessionUser,
} from "@/lib/auth-guard-server";
import { hasFullSkillProgram, isDiagnosticComplete } from "@/lib/entitlement";
import { fetchDashboardStreak } from "@/lib/dashboard-server";
import {
  emptyLearningProfile,
  fetchLearningProfile,
} from "@/lib/learning-server";
import { fetchSubscription } from "@/lib/payments-server";
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
};

type DashboardBodyProps = {
  cookieHeader: string;
  user: UserProps;
  userId: string;
};

async function DashboardBody({ cookieHeader, user, userId }: DashboardBodyProps) {
  const [subscription, learning, streak] = await Promise.all([
    fetchSubscription(cookieHeader),
    fetchLearningProfile(cookieHeader),
    fetchDashboardStreak(cookieHeader),
  ]);
  const profile = learning ?? emptyLearningProfile(userId);

  // Stay on dashboard: unpaid users see the plan paywall (start vs unlock).
  // Post-login continue routes unpaid users into diagnostic/checkout instead.
  if (!hasFullSkillProgram(subscription)) {
    return (
      <>
        <DashboardTopHeader
          firstName={user.firstName}
          displayName={user.displayName}
          email={user.email}
          avatarUrl={user.avatarUrl}
          streakDays={0}
          showReportButton={false}
        />
        <DashboardPlanPaywall hasDiagnostic={isDiagnosticComplete(profile)} />
      </>
    );
  }

  return (
    <DashboardGate learning={profile} subscription={subscription}>
      <DashboardPersonalizedSection
        learning={profile}
        streakDays={streak.current_streak}
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
  };

  return (
    <>
      <DashboardProfileSync />
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
