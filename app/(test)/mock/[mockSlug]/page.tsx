import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mock test · BandForge",
  robots: { index: false, follow: false },
};
import { authBootstrapPath } from "@/lib/auth";
import { MOCK_DISPLAY_LABEL, mockApiId, mockHubPath } from "@/lib/mock-catalog";
import { ensureCanonicalMockHub } from "@/lib/mock-route-guard";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { fetchMockSessionServer } from "@/lib/mock-server";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { MockTestHub } from "@/modules/mock/components/mock-test-hub";

type Props = { params: Promise<{ mockSlug: string }> };

export default async function MockTestPage({ params }: Props) {
  const { mockSlug } = await params;
  ensureCanonicalMockHub(mockSlug);

  const mockTestId = mockApiId(mockSlug);
  const cookieHeader = await getCachedCookieHeader();
  const [user, initialProgress] = await Promise.all([
    getCachedServerUser(cookieHeader),
    fetchMockSessionServer(cookieHeader, mockTestId),
  ]);
  if (!user) {
    redirect(authBootstrapPath(mockHubPath(mockSlug)));
  }

  return (
    <MockLayout>
      <MockTestHub
        mockSlug={mockSlug}
        mockTestId={mockTestId}
        title={MOCK_DISPLAY_LABEL}
        initialProgress={initialProgress}
      />
    </MockLayout>
  );
}
