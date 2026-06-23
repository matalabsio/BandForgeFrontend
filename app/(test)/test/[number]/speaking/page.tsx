import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  canonicalMockSlug,
  mockTestIdForNumber,
  shortModuleExamPath,
} from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { resolveMockMetaServer } from "@/lib/mock-server";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { SpeakingPage } from "@/modules/speaking/components/speaking-page";

export const metadata: Metadata = {
  title: "Speaking · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
};

export default async function TestSpeakingPage({ params }: Props) {
  const { number: numberRaw } = await params;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const mockTestId = mockTestIdForNumber(testNumber);
  const mockSlug = canonicalMockSlug(mockTestId);
  const returnPath = shortModuleExamPath(testNumber, "speaking");

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);
  const mockMeta = await resolveMockMetaServer(cookieHeader, mockTestId);

  return (
    <MockLayout>
      <SpeakingPage
        mockTestId={mockTestId}
        mockSlug={mockSlug}
        mockMeta={mockMeta}
        testNumber={testNumber}
      />
    </MockLayout>
  );
}
