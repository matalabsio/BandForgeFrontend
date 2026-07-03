import { Suspense } from "react";
import { ProductionAuthConfigError } from "@/components/auth/production-auth-config-error";
import { DashboardProfileSync } from "@/components/bandforge/dashboard/dashboard-profile-sync";
import { DashboardContentSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";
import { DashboardMocksActivitySection } from "@/components/bandforge/dashboard/sections/dashboard-mocks-activity-section";
import { DashboardStatsSection } from "@/components/bandforge/dashboard/sections/dashboard-stats-section";
import {
  isProductionAuthMisconfigured,
  redirectIfUnauthenticated,
  resolveSessionUser,
} from "@/lib/auth-guard-server";
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

function DashboardHeaderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-14 animate-pulse rounded-2xl bg-ink/[0.06]" />
      <div className="h-40 animate-pulse rounded-[20px] bg-ink/[0.06]" />
    </div>
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

  const userProps = {
    firstName: getUserFirstName(sessionUser),
    displayName: formatUserDisplayName(sessionUser),
    email: sessionUser.email,
    avatarUrl: sessionUser.avatar_display_url ?? null,
  };

  return (
    <>
      <DashboardProfileSync />
      <div className="space-y-6">
        <Suspense fallback={<DashboardHeaderSkeleton />}>
          <DashboardStatsSection cookieHeader={cookieHeader} user={userProps} />
        </Suspense>
        <Suspense fallback={<DashboardContentSkeleton />}>
          <DashboardMocksActivitySection cookieHeader={cookieHeader} />
        </Suspense>
      </div>
    </>
  );
}
