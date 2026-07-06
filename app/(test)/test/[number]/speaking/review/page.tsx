import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockTestIdForNumber } from "@/lib/mock-catalog";
import { speakingModuleReviewPath } from "@/lib/module-review-paths";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { SpeakingModuleReviewClient } from "@/modules/mock/components/speaking-module-review-client";

export const metadata: Metadata = {
  title: "Speaking review · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
};

export default async function SpeakingReviewPage({ params }: Props) {
  const { number: numberRaw } = await params;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const mockTestId = mockTestIdForNumber(testNumber);
  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, speakingModuleReviewPath(testNumber));

  return (
    <MockLayout>
      <SpeakingModuleReviewClient testId={mockTestId} testNumber={testNumber} />
    </MockLayout>
  );
}
