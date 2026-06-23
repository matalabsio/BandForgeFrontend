import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  canonicalMockSlug,
  mockTestIdForNumber,
  shortModuleSpeakingPendingPath,
} from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { SpeakingPendingPage } from "@/modules/speaking/components/speaking-pending-page";

export const metadata: Metadata = {
  title: "Speaking submitted · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ attempt?: string }>;
};

export default async function TestSpeakingPendingPage({ params, searchParams }: Props) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const attemptId = sp.attempt?.trim();
  if (!attemptId) {
    redirect(`/test/${testNumber}/speaking`);
  }

  const mockTestId = mockTestIdForNumber(testNumber);
  const returnPath = shortModuleSpeakingPendingPath(testNumber, attemptId);

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);

  return (
    <MockLayout>
      <SpeakingPendingPage
        attemptId={attemptId}
        testNumber={testNumber}
        mockTestId={mockTestId}
      />
    </MockLayout>
  );
}
