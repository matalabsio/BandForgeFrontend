import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  canonicalMockSlug,
  shortModuleExamPath,
} from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { parseSkillContext } from "@/lib/practice-submit";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { resolveCatalogSlotServer } from "@/lib/mock-server";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { SpeakingPage } from "@/modules/speaking/components/speaking-page";

export const metadata: Metadata = {
  title: "Speaking · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ skill_context?: string }>;
};

export default async function TestSpeakingPage({ params, searchParams }: Props) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const returnPath = shortModuleExamPath(testNumber, "speaking");

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);

  const resolved = await resolveCatalogSlotServer(cookieHeader, testNumber);
  if (!resolved) notFound();
  const { mockTestId, mockMeta } = resolved;
  const mockSlug = canonicalMockSlug(mockTestId);
  const skillContext = parseSkillContext(sp.skill_context);

  return (
    <MockLayout>
      <SpeakingPage
        mockTestId={mockTestId}
        mockSlug={mockSlug}
        mockMeta={mockMeta}
        testNumber={testNumber}
        skillContext={skillContext}
      />
    </MockLayout>
  );
}
