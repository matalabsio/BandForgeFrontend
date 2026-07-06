import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveAuthRedirectPath } from "@/lib/auth";
import {
  mockHubPath,
  publishedSlugForMockRef,
  testNumberForMockId,
} from "@/lib/mock-catalog";
import { mockResultsPathForTest } from "@/lib/module-review-paths";
import { ensureCanonicalMockHub } from "@/lib/mock-route-guard";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { MockResultsGate } from "@/modules/mock/components/mock-results-gate";

export const metadata: Metadata = {
  title: "Mock results · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{ mock_attempt?: string }>;
};

export default async function MockResultsPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  ensureCanonicalMockHub(mockSlug);

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  if (!user) {
    redirect(resolveAuthRedirectPath(mockHubPath(mockSlug), cookieHeader));
  }

  const published = publishedSlugForMockRef(mockSlug);
  if (published) {
    const testNumber = testNumberForMockId(mockSlug);
    const dest = mockResultsPathForTest(testNumber, sp.mock_attempt ?? null);
    redirect(dest);
  }

  return (
    <MockLayout>
      <MockResultsGate mockSlug={mockSlug} initialSummary={null} />
    </MockLayout>
  );
}
