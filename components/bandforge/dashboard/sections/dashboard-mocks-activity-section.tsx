import { AiCoachCard } from "@/components/bandforge/dashboard/ai-coach-card";
import { DashboardDataRetry } from "@/components/bandforge/dashboard/dashboard-data-retry";
import { MockTestsSection } from "@/components/bandforge/dashboard/mock-tests-section";
import { PerformanceChartLazy } from "@/components/bandforge/dashboard/performance-chart-lazy";
import { ProTipBar } from "@/components/bandforge/dashboard/pro-tip-bar";
import { RecentActivity } from "@/components/bandforge/dashboard/recent-activity";
import { StudyActivityCard } from "@/components/bandforge/dashboard/study-activity-card";
import { buildCatalogPanel } from "@/lib/mock-catalog-api";
import {
  M01_MOCK_TEST_ID,
  M02_MOCK_TEST_ID,
  shortModuleWritingResultsPath,
  testNumberForMockId,
} from "@/lib/mock-catalog";
import {
  fetchDashboardPayload,
  shouldFetchDashboardApi,
} from "@/lib/dashboard-server";
import { fetchLearningProfile } from "@/lib/learning-server";
import { fetchMockCatalogServer, fetchMockSessionServer } from "@/lib/mock-server";
import { isAuthEnabled } from "@/lib/flags";

type Props = {
  cookieHeader: string;
};

function latestWritingCoachHref(
  recent: { id: string; module: string; status: string; mock_test: { id: string } }[],
): string | null {
  const writing = recent.find(
    (a) =>
      a.module === "writing" &&
      (a.status === "completed" || a.status === "submitted"),
  );
  if (!writing) return null;
  const testNumber = testNumberForMockId(writing.mock_test.id);
  return shortModuleWritingResultsPath(testNumber, writing.id);
}

export async function DashboardMocksActivitySection({ cookieHeader }: Props) {
  const [payloadResult, , , catalog, learning] = await Promise.all([
    fetchDashboardPayload(cookieHeader),
    fetchMockSessionServer(cookieHeader, M01_MOCK_TEST_ID),
    fetchMockSessionServer(cookieHeader, M02_MOCK_TEST_ID),
    fetchMockCatalogServer(cookieHeader),
    fetchLearningProfile(cookieHeader),
  ]);

  const { mockTestsFromApi, summary } = payloadResult;
  const catalogSlots = buildCatalogPanel(catalog);
  const hasAttempts = summary.recent.length > 0;
  const needsRetry =
    isAuthEnabled() &&
    shouldFetchDashboardApi(cookieHeader) &&
    !mockTestsFromApi;
  const targetBand = learning?.target_band ?? null;
  const coachHref = latestWritingCoachHref(summary.recent);
  const teaserLines = (learning?.recommendations ?? [])
    .slice(0, 2)
    .map((r) => r.title);

  return (
    <DashboardDataRetry needsRetry={needsRetry}>
      <MockTestsSection catalogSlots={catalogSlots} />
      {hasAttempts ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
            <div className="flex min-h-0 min-w-0 flex-col [&_>_*]:h-full [&_>_*]:min-h-0">
              <PerformanceChartLazy
                attempts={summary.recent}
                averageBand={summary.stats.average_band}
                targetBand={targetBand}
              />
            </div>
            <div className="flex min-h-0 min-w-0 flex-col [&_>_*]:h-full [&_>_*]:min-h-0">
              <StudyActivityCard days={summary.activity_days ?? []} />
            </div>
            <div className="flex min-h-0 min-w-0 flex-col [&_>_*]:h-full [&_>_*]:min-h-0">
              <AiCoachCard coachHref={coachHref} teaserLines={teaserLines} />
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
