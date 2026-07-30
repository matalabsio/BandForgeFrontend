import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
  const returnPath = shortModuleExamPath(testNumber, "writing", { part });

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);

  const resolved = await resolveCatalogSlotServer(cookieHeader, testNumber);
  if (!resolved) notFound();
  const { mockTestId, mockMeta } = resolved;
  const mockSlug = canonicalMockSlug(mockTestId);

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
