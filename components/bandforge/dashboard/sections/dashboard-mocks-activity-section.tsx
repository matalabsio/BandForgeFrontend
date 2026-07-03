import { AiCoachCard } from "@/components/bandforge/dashboard/ai-coach-card";
import { DashboardDataRetry } from "@/components/bandforge/dashboard/dashboard-data-retry";
import { MockTestsSection } from "@/components/bandforge/dashboard/mock-tests-section";
import { PerformanceChartLazy } from "@/components/bandforge/dashboard/performance-chart-lazy";
import { ProTipBar } from "@/components/bandforge/dashboard/pro-tip-bar";
import { RecentActivity } from "@/components/bandforge/dashboard/recent-activity";
import { StudyActivityCard } from "@/components/bandforge/dashboard/study-activity-card";
import { buildCatalogPanel } from "@/lib/mock-catalog-api";
import { M01_MOCK_TEST_ID, M02_MOCK_TEST_ID } from "@/lib/mock-catalog";
import {
  fetchDashboardPayload,
  shouldFetchDashboardApi,
} from "@/lib/dashboard-server";
import { fetchMockCatalogServer, fetchMockSessionServer } from "@/lib/mock-server";
import { isAuthEnabled } from "@/lib/flags";

type Props = {
  cookieHeader: string;
};

export async function DashboardMocksActivitySection({ cookieHeader }: Props) {
  const [payloadResult, , , catalog] = await Promise.all([
    fetchDashboardPayload(cookieHeader),
    fetchMockSessionServer(cookieHeader, M01_MOCK_TEST_ID),
    fetchMockSessionServer(cookieHeader, M02_MOCK_TEST_ID),
    fetchMockCatalogServer(cookieHeader),
  ]);

  const { mockTestsFromApi, summary } = payloadResult;
  const catalogSlots = buildCatalogPanel(catalog);
  const hasAttempts = summary.recent.length > 0;
  const needsRetry =
    isAuthEnabled() &&
    shouldFetchDashboardApi(cookieHeader) &&
    !mockTestsFromApi;

  return (
    <DashboardDataRetry needsRetry={needsRetry}>
      <MockTestsSection catalogSlots={catalogSlots} />
      {hasAttempts ? (
        <>
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
          <div className="bf-below-fold">
            <RecentActivity attempts={summary.recent} />
          </div>
        </>
      ) : null}
      <ProTipBar />
    </DashboardDataRetry>
  );
}
