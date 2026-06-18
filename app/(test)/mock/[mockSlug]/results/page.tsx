import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authBootstrapPath } from "@/lib/auth";
import { mockHubPath } from "@/lib/mock-catalog";
import { ensureCanonicalMockHub } from "@/lib/mock-route-guard";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
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
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authBootstrapPath(mockHubPath(mockSlug)));
  }

  return (
    <MockLayout>
      <MockResultsGate mockSlug={mockSlug} initialSummary={null} />
    </MockLayout>
  );
}
