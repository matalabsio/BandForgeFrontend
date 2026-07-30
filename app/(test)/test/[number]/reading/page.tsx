import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  canonicalMockSlug,
  shortModuleExamPath,
} from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { parseSkillContext } from "@/lib/practice-submit";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { fetchReadingBootServer, resolveCatalogSlotServer } from "@/lib/mock-server";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { ReadingPage } from "@/modules/reading/components/reading-page";
import { MockLayout } from "@/modules/mock/components/mock-layout";

export const metadata: Metadata = {
  title: "Reading · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{
    passage?: string;
    mock_attempt?: string;
    auto?: string;
    skill_context?: string;
  }>;
};

export default async function TestReadingPage({ params, searchParams }: Props) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const passage = sp.passage ? Number.parseInt(sp.passage, 10) : 1;
  const autoStart = sp.auto === "1" || sp.auto === "true";
  const skillContext = parseSkillContext(sp.skill_context);
  const returnPath = shortModuleExamPath(testNumber, "reading", { passage });

  const cookieHeader = await getCachedCookieHeader();
  const { user, cookieHeader: authCookies } = await guardMockModulePage(
    cookieHeader,
    returnPath,
  );

  const resolved = await resolveCatalogSlotServer(authCookies, testNumber);
  if (!resolved) notFound();
  const { mockTestId, mockMeta } = resolved;
  const mockSlug = canonicalMockSlug(mockTestId);

  const initialBoot =
    user && sp.mock_attempt
      ? await fetchReadingBootServer(
          authCookies,
          mockTestId,
          passage,
          sp.mock_attempt,
        )
      : null;

  return (
    <MockLayout>
      <ReadingPage
        key={`${passage}-${sp.mock_attempt ?? "solo"}`}
        testId={mockTestId}
        mockSlug={mockSlug}
        mockMeta={mockMeta}
        passage={passage}
        autoStart={autoStart}
        initialBoot={initialBoot}
        testNumber={testNumber}
        skillContext={skillContext}
      />
    </MockLayout>
  );
}
