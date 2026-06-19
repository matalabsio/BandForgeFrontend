import { ProductionAuthConfigError } from "@/components/auth/production-auth-config-error";
import { DashboardData } from "@/components/bandforge/dashboard/dashboard-data";
import { DashboardDataRetry } from "@/components/bandforge/dashboard/dashboard-data-retry";
import { DashboardProfileSync } from "@/components/bandforge/dashboard/dashboard-profile-sync";
import {
  isProductionAuthMisconfigured,
  redirectIfUnauthenticated,
  resolveSessionUser,
} from "@/lib/auth-guard-server";
import { isAuthEnabled } from "@/lib/flags";
import { shouldFetchDashboardApi } from "@/lib/dashboard-server";
import { M01_MOCK_TEST_ID, M02_MOCK_TEST_ID } from "@/lib/mock-catalog";
import { buildCatalogPanel } from "@/lib/mock-catalog-api";
import { fetchMockCatalogServer, fetchMockSessionServer } from "@/lib/mock-server";
import {
  getCachedCookieHeader,
  getCachedDashboardPayload,
  getCachedServerUser,
} from "@/lib/server-cache";
import {
  formatUserDisplayName,
  getUserFirstName,
} from "@/lib/user-display";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard · BandForge",
};

async function DashboardPageContent() {
  if (isProductionAuthMisconfigured()) {
    return <ProductionAuthConfigError />;
  }

  const cookieHeader = await getCachedCookieHeader();
  const [user, payloadResult, initialM01Progress, initialM02Progress, catalog] =
    await Promise.all([
      getCachedServerUser(cookieHeader),
      getCachedDashboardPayload(cookieHeader),
      fetchMockSessionServer(cookieHeader, M01_MOCK_TEST_ID),
      fetchMockSessionServer(cookieHeader, M02_MOCK_TEST_ID),
      fetchMockCatalogServer(cookieHeader),
    ]);
  redirectIfUnauthenticated(user, "/dashboard");
  const sessionUser = resolveSessionUser(user);

  const { mockTests, mockTestsFromApi, summary } = payloadResult;
  const catalogSlots = buildCatalogPanel(catalog);
  const needsRetry =
    isAuthEnabled() &&
    shouldFetchDashboardApi(cookieHeader) &&
    !mockTestsFromApi;

  return (
    <DashboardDataRetry needsRetry={needsRetry}>
      <DashboardData
        firstName={getUserFirstName(sessionUser)}
        displayName={formatUserDisplayName(sessionUser)}
        email={sessionUser.email}
        avatarUrl={sessionUser.avatar_display_url}
        mockTests={mockTests}
        catalogSlots={catalogSlots}
        summary={summary}
        profileTargetBand={
          sessionUser.target_band !== null && sessionUser.target_band !== undefined
            ? sessionUser.target_band
            : null
        }
        initialMockProgressById={{
          [M01_MOCK_TEST_ID]: initialM01Progress,
          [M02_MOCK_TEST_ID]: initialM02Progress,
        }}
      />
    </DashboardDataRetry>
  );
}

export default function DashboardPage() {
  return (
    <>
      <DashboardProfileSync />
      <DashboardPageContent />
    </>
  );
}
