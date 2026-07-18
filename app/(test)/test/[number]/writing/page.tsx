import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  canonicalMockSlug,
  mockTestIdForNumber,
  shortModuleExamPath,
} from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { parseSkillContext } from "@/lib/practice-submit";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { resolveMockMetaServer } from "@/lib/mock-server";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { WritingPage } from "@/modules/writing/components/writing-page";

export const metadata: Metadata = {
  title: "Writing · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ part?: string; skill_context?: string }>;
};

export default async function TestWritingPage({ params, searchParams }: Props) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const partRaw = sp.part ? Number.parseInt(sp.part, 10) : 1;
  if (partRaw !== 1 && partRaw !== 2) {
    redirect(shortModuleExamPath(testNumber, "writing", { part: 1 }));
  }
  const part = partRaw as 1 | 2;
  const skillContext = parseSkillContext(sp.skill_context);
  const mockTestId = mockTestIdForNumber(testNumber);
  const mockSlug = canonicalMockSlug(mockTestId);
  const returnPath = shortModuleExamPath(testNumber, "writing", { part });

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);
  const mockMeta = await resolveMockMetaServer(cookieHeader, mockTestId);

  return (
    <MockLayout>
      <WritingPage
        mockTestId={mockTestId}
        mockSlug={mockSlug}
        mockMeta={mockMeta}
        part={part}
        testNumber={testNumber}
        skillContext={skillContext}
      />
    </MockLayout>
  );
}
