import { DashboardBandHero, DashboardEmptyHero } from "@/components/bandforge/dashboard/dashboard-band-hero";
import { DashboardEmptyModules } from "@/components/bandforge/dashboard/dashboard-empty-modules";
import { DashboardModuleProgress } from "@/components/bandforge/dashboard/dashboard-module-progress";
import { DashboardTopHeader } from "@/components/bandforge/dashboard/dashboard-top-header";
import { DashboardTodaysPlan } from "@/components/bandforge/dashboard/dashboard-todays-plan";
import { fetchDashboardSummary } from "@/lib/dashboard-server";
import { latestBandByModule, countTestedModuleBands } from "@/components/scores/scores-utils";

type UserProps = {
  firstName: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
};

type Props = {
  cookieHeader: string;
  user: UserProps;
};

export async function DashboardStatsSection({ cookieHeader, user }: Props) {
  const summary = await fetchDashboardSummary(cookieHeader);
  const streak = summary.stats.current_streak ?? 0;
  const hasAttempts = summary.recent.length > 0;
  const overallBand = summary.stats.average_band;
  const testsCompleted = summary.recent.length;
  const moduleBands = latestBandByModule(summary.recent);
  const testedModuleCount = countTestedModuleBands(moduleBands, summary.recent);

  return (
    <>
      <DashboardTopHeader
        firstName={user.firstName}
        displayName={user.displayName}
        email={user.email}
        avatarUrl={user.avatarUrl}
        streakDays={streak}
      />
      {hasAttempts ? (
        <>
          <DashboardBandHero
            overallBand={overallBand}
            testsCompleted={testsCompleted}
            moduleBands={moduleBands}
          />
          <DashboardModuleProgress
            recent={summary.recent}
            bands={moduleBands}
            testedCount={testedModuleCount}
            moduleCount={moduleBands.length}
          />
          <DashboardTodaysPlan />
        </>
      ) : (
        <>
          <DashboardEmptyHero firstName={user.firstName} />
          <DashboardEmptyModules />
        </>
      )}
    </>
  );
}
