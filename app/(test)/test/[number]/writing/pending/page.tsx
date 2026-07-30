import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { shortModuleWritingPendingPath } from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { resolveCatalogSlotServer } from "@/lib/mock-server";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { WritingPendingPage } from "@/modules/writing/components/writing-pending-page";

export const metadata: Metadata = {
  title: "Writing submitted · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ attempt?: string }>;
};

export default async function TestWritingPendingPage({ params, searchParams }: Props) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const attemptId = sp.attempt?.trim();
  if (!attemptId) {
    redirect(`/test/${testNumber}/writing`);
  }

  const returnPath = shortModuleWritingPendingPath(testNumber, attemptId);

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);

  const resolved = await resolveCatalogSlotServer(cookieHeader, testNumber);
  if (!resolved) notFound();

  return (
    <MockLayout>
      <WritingPendingPage
        attemptId={attemptId}
        testNumber={testNumber}
        mockTestId={resolved.mockTestId}
      />
    </MockLayout>
  );
}
