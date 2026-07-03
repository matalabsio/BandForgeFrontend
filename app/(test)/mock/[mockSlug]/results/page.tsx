import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveAuthRedirectPath } from "@/lib/auth";
import { mockHubPath } from "@/lib/mock-catalog";
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
};

export default async function MockResultsPage({ params }: Props) {
  const { mockSlug } = await params;
  ensureCanonicalMockHub(mockSlug);

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  if (!user) {
    redirect(resolveAuthRedirectPath(mockHubPath(mockSlug), cookieHeader));
  }

  return (
    <MockLayout>
      <MockResultsGate mockSlug={mockSlug} initialSummary={null} />
    </MockLayout>
  );
}
