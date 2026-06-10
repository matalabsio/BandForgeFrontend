import { AiCoachCard } from "@/components/bandforge/dashboard/ai-coach-card";
import { MockTestsSection } from "@/components/bandforge/dashboard/mock-tests-section";
import { DashboardStatRow } from "@/components/bandforge/dashboard/dashboard-stat-row";
import { DashboardTopHeader } from "@/components/bandforge/dashboard/dashboard-top-header";
import { PerformanceChartLazy } from "@/components/bandforge/dashboard/performance-chart-lazy";
import { ProTipBar } from "@/components/bandforge/dashboard/pro-tip-bar";
import { RecentActivity } from "@/components/bandforge/dashboard/recent-activity";
import { StudyActivityCard } from "@/components/bandforge/dashboard/study-activity-card";
import type {
  DashboardSummary,
  MockTestSummary,
} from "@/components/bandforge/dashboard/types";
import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";

type Props = {
  firstName: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  mockTests: MockTestSummary[];
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
  summary,
  profileTargetBand = null,
  initialMockProgressById = {},
}: Props) {
  const streak = summary.stats.current_streak ?? 0;

  return (
    <div className="space-y-6">
      <DashboardTopHeader
        firstName={firstName}
        displayName={displayName}
        email={email}
        avatarUrl={avatarUrl}
        streakDays={streak}
      />

      <DashboardStatRow
        stats={summary.stats}
        profileTargetBand={profileTargetBand}
      />

      <MockTestsSection />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
        <div className="min-w-0">
          <PerformanceChartLazy
            attempts={summary.recent}
            averageBand={summary.stats.average_band}
          />
        </div>
        <div className="min-w-0">
          <StudyActivityCard days={summary.activity_days ?? []} />
        </div>
        <div className="min-w-0">
          <AiCoachCard />
        </div>
      </div>

      {summary.recent.length > 0 ? (
        <div className="bf-below-fold">
          <RecentActivity attempts={summary.recent} />
        </div>
      ) : null}

      <ProTipBar />
    </div>
  );
}
