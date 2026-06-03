import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authBootstrapPath } from "@/lib/auth";
import {
  M01_MOCK_TEST_ID,
  MOCK_DISPLAY_LABEL,
  DEFAULT_MOCK_SLUG,
  test1HubPath,
} from "@/lib/mock-catalog";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { fetchMockSessionServer } from "@/lib/mock-server";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { MockTestHub } from "@/modules/mock/components/mock-test-hub";

export const metadata: Metadata = {
  title: `${MOCK_DISPLAY_LABEL} · BandForge`,
  robots: { index: false, follow: false },
};

export default async function Test1HubPage() {
  const cookieHeader = await getCachedCookieHeader();
  const [user, initialProgress] = await Promise.all([
    getCachedServerUser(cookieHeader),
    fetchMockSessionServer(cookieHeader, M01_MOCK_TEST_ID),
  ]);
  if (!user) {
    redirect(authBootstrapPath(test1HubPath()));
  }

  return (
    <MockLayout>
      <MockTestHub
        mockSlug={DEFAULT_MOCK_SLUG}
        mockTestId={M01_MOCK_TEST_ID}
        title={MOCK_DISPLAY_LABEL}
        initialProgress={initialProgress}
      />
    </MockLayout>
  );
}
