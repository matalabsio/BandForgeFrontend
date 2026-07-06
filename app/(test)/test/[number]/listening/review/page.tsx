import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockTestIdForNumber } from "@/lib/mock-catalog";
import { listeningModuleReviewPath } from "@/lib/module-review-paths";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { ObjectiveModuleReviewClient } from "@/modules/mock/components/objective-module-review-client";

export const metadata: Metadata = {
  title: "Listening review · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
};

export default async function ListeningReviewPage({ params }: Props) {
  const { number: numberRaw } = await params;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const mockTestId = mockTestIdForNumber(testNumber);
  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, listeningModuleReviewPath(testNumber));

  return (
    <MockLayout>
      <ObjectiveModuleReviewClient
        testId={mockTestId}
        module="listening"
        testNumber={testNumber}
      />
    </MockLayout>
  );
}
