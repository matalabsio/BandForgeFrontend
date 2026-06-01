import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mock results · BandForge",
  robots: { index: false, follow: false },
};
import { authBootstrapPath } from "@/lib/auth";
import { mockHubPath } from "@/lib/mock-catalog";
import { ensureCanonicalMockHub } from "@/lib/mock-route-guard";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { fetchMockSummaryServer } from "@/lib/mock-server";
import { MockResults } from "@/modules/mock/components/mock-results";
import { MockLayout } from "@/modules/mock/components/mock-layout";

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{ mock_attempt?: string }>;
};

export default async function MockResultsPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  ensureCanonicalMockHub(mockSlug);

  const sp = await searchParams;
  const mockAttemptId = sp.mock_attempt;

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authBootstrapPath(mockHubPath(mockSlug)));
  }

  if (!mockAttemptId) {
    redirect(mockHubPath(mockSlug));
  }

  const initialSummary = await fetchMockSummaryServer(
    cookieHeader,
    mockAttemptId,
  );

  return (
    <MockLayout>
      <MockResults
        key={mockAttemptId}
        mockSlug={mockSlug}
        mockAttemptId={mockAttemptId}
        initialSummary={initialSummary}
      />
    </MockLayout>
  );
}
