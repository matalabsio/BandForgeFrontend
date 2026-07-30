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
  const returnPath = shortModuleExamPath(testNumber, "listening", { part });

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);

  const resolved = await resolveCatalogSlotServer(cookieHeader, testNumber);
  if (!resolved) notFound();
  const { mockTestId, mockMeta } = resolved;
  const mockSlug = canonicalMockSlug(mockTestId);

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
