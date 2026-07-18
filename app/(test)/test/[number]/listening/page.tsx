import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  canonicalMockSlug,
  mockApiId,
  mockTestIdForNumber,
  shortModuleExamPath,
} from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { parseSkillContext } from "@/lib/practice-submit";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { resolveMockMetaServer } from "@/lib/mock-server";
import { ListeningPage } from "@/modules/listening/components/listening-page";
import { MockLayout } from "@/modules/mock/components/mock-layout";

export const metadata: Metadata = {
  title: "Listening · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ part?: string; skill_context?: string }>;
};

export default async function TestListeningPage({ params, searchParams }: Props) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const part = sp.part ? Number.parseInt(sp.part, 10) : 1;
  const skillContext = parseSkillContext(sp.skill_context);
  const mockTestId = mockTestIdForNumber(testNumber);
  const mockSlug = canonicalMockSlug(mockTestId);
  const returnPath = shortModuleExamPath(testNumber, "listening", { part });

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);
  const mockMeta = await resolveMockMetaServer(cookieHeader, mockTestId);

  return (
    <MockLayout>
      <ListeningPage
        testId={mockTestId}
        mockSlug={mockSlug}
        mockMeta={mockMeta}
        part={part}
        variant="exam"
        testNumber={testNumber}
        skillContext={skillContext}
      />
    </MockLayout>
  );
}
