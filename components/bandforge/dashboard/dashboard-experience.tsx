import { AiCoachCard } from "@/components/bandforge/dashboard/ai-coach-card";
import {
  DashboardBandHero,
  DashboardEmptyHero,
} from "@/components/bandforge/dashboard/dashboard-band-hero";
import { DashboardEmptyModules } from "@/components/bandforge/dashboard/dashboard-empty-modules";
import { DashboardModuleProgress } from "@/components/bandforge/dashboard/dashboard-module-progress";
import { MockTestsSection } from "@/components/bandforge/dashboard/mock-tests-section";
import { DashboardTopHeader } from "@/components/bandforge/dashboard/dashboard-top-header";
import { DashboardTodaysPlan } from "@/components/bandforge/dashboard/dashboard-todays-plan";
import { PerformanceChartLazy } from "@/components/bandforge/dashboard/performance-chart-lazy";
import { ProTipBar } from "@/components/bandforge/dashboard/pro-tip-bar";
import { RecentActivity } from "@/components/bandforge/dashboard/recent-activity";
import { StudyActivityCard } from "@/components/bandforge/dashboard/study-activity-card";
import type {
  DashboardSummary,
  MockTestSummary,
} from "@/components/bandforge/dashboard/types";
import { countTestedModuleBands, dashboardModuleBands, dashboardOverallBand } from "@/components/scores/scores-utils";
import type { MockCatalogSlot } from "@/lib/mock-catalog-api";
import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";

type Props = {
  firstName: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  mockTests: MockTestSummary[];
  catalogSlots?: MockCatalogSlot[];
  summary: DashboardSummary;
  profileTargetBand?: number | null;
  initialMockProgressById?: Partial<Record<string, MockAttemptProgress | null>>;
};

export function DashboardExperience({
  firstName,
  displayName,
  email = null,
  avatarUrl = null,
  mockTests,
  catalogSlots,
  summary,
  profileTargetBand = null,
  initialMockProgressById = {},
}: Props) {
  const streak = summary.stats.current_streak ?? 0;
  const hasAttempts = summary.recent.length > 0;
  const overallBand = dashboardOverallBand(summary);
  const testsCompleted = summary.completed_mock_count ?? 0;
  const moduleBands = dashboardModuleBands(summary.recent, summary.latest_mock);
  const testedModuleCount = countTestedModuleBands(moduleBands, summary.recent);

  return (
    <div className="space-y-6">
      <DashboardTopHeader
        firstName={firstName}
        displayName={displayName}
        email={email}
        avatarUrl={avatarUrl}
        streakDays={streak}
        showReportButton={false}
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
          <DashboardEmptyHero firstName={firstName} />
          <DashboardEmptyModules />
        </>
      )}

      <MockTestsSection catalogSlots={catalogSlots} />

      {hasAttempts ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
            <div className="min-w-0">
              <PerformanceChartLazy
                attempts={summary.recent}
                averageBand={summary.stats.average_band}
                targetBand={profileTargetBand}
              />
            </div>
            <div className="min-w-0">
              <StudyActivityCard days={summary.activity_days ?? []} />
            </div>
            <div className="min-w-0">
              <AiCoachCard />
            </div>
          </div>
          <div className="bf-below-fold">
            <RecentActivity attempts={summary.recent} />
          </div>
        </>
      ) : null}

      <ProTipBar />
    </div>
  );
}
