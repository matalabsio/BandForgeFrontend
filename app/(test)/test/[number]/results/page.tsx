import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonicalMockSlug } from "@/lib/mock-catalog";
import { mockResultsPathForTest } from "@/lib/module-review-paths";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { resolveCatalogSlotServer } from "@/lib/mock-server";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { MockResultsGate } from "@/modules/mock/components/mock-results-gate";

export const metadata: Metadata = {
  title: "Mock results · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
};

export default async function TestResultsPage({ params }: Props) {
  const { number: numberRaw } = await params;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, mockResultsPathForTest(testNumber));

  const resolved = await resolveCatalogSlotServer(cookieHeader, testNumber);
  if (!resolved) notFound();
  const mockSlug = canonicalMockSlug(resolved.mockTestId);

  return (
    <MockLayout>
      <MockResultsGate
        mockSlug={mockSlug}
        testNumber={testNumber}
        initialSummary={null}
      />
    </MockLayout>
  );
}
