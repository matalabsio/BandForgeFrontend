import { redirect } from "next/navigation";
import { DashboardData } from "@/components/bandforge/dashboard/dashboard-data";
import { DashboardDataRetry } from "@/components/bandforge/dashboard/dashboard-data-retry";
import { DashboardProfileSync } from "@/components/bandforge/dashboard/dashboard-profile-sync";
import { authGuardRedirectPath } from "@/lib/auth";
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
  const cookieHeader = await getCachedCookieHeader();
  const [user, payloadResult, initialM01Progress, initialM02Progress, catalog] =
    await Promise.all([
      getCachedServerUser(cookieHeader),
      getCachedDashboardPayload(cookieHeader),
      fetchMockSessionServer(cookieHeader, M01_MOCK_TEST_ID),
      fetchMockSessionServer(cookieHeader, M02_MOCK_TEST_ID),
      fetchMockCatalogServer(cookieHeader),
    ]);
  if (!user) {
    redirect(authGuardRedirectPath("/dashboard"));
  }

  const { mockTests, mockTestsFromApi, summary } = payloadResult;
  const catalogSlots = buildCatalogPanel(catalog);
  const needsRetry =
    isAuthEnabled() &&
    shouldFetchDashboardApi(cookieHeader) &&
    !mockTestsFromApi;

  return (
    <DashboardDataRetry needsRetry={needsRetry}>
      <DashboardData
        firstName={getUserFirstName(user)}
        displayName={formatUserDisplayName(user)}
        email={user.email}
        avatarUrl={user.avatar_display_url}
        mockTests={mockTests}
        catalogSlots={catalogSlots}
        summary={summary}
        profileTargetBand={
          user.target_band !== null && user.target_band !== undefined
            ? user.target_band
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
