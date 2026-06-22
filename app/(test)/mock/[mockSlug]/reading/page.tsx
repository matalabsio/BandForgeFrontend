import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  canonicalMockSlug,
  isLiveCatalogTestNumber,
  legacyModuleExamRedirectPath,
  mockApiId,
  mockModulePath,
  testNumberForMockId,
} from "@/lib/mock-catalog";
import { ensureCanonicalMockSlug } from "@/lib/mock-route-guard";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { fetchReadingBootServer, resolveMockMetaServer } from "@/lib/mock-server";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { ReadingPage } from "@/modules/reading/components/reading-page";
import { MockLayout } from "@/modules/mock/components/mock-layout";

export const metadata: Metadata = {
  title: "Reading · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{
    passage?: string;
    mock_attempt?: string;
    auto?: string;
    section_start?: string;
  }>;
};

export default async function MockReadingPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  const passage = sp.passage ? Number.parseInt(sp.passage, 10) : 1;
  const mockTestId = mockApiId(mockSlug);
  const testNumber = testNumberForMockId(mockTestId);
  const autoStart =
    sp.auto === "1" || sp.auto === "true" || Boolean(sp.mock_attempt);
  const sectionStart = sp.section_start === "1";

  if (isLiveCatalogTestNumber(testNumber)) {
    redirect(
      legacyModuleExamRedirectPath(testNumber, "reading", {
        passage,
        auto: autoStart,
        sectionStart,
        mockAttemptId: sp.mock_attempt,
      }),
    );
  }

  ensureCanonicalMockSlug(mockSlug, (slug) =>
    mockModulePath(slug, "reading", { passage }),
  );

  const cookieHeader = await getCachedCookieHeader();
  const returnPath = mockModulePath(mockSlug, "reading", { passage });
  const { user, cookieHeader: authCookies } = await guardMockModulePage(
    cookieHeader,
    returnPath,
  );

  const initialBoot =
    user && sp.mock_attempt
      ? await fetchReadingBootServer(
          authCookies,
          mockTestId,
          passage,
          sp.mock_attempt,
        )
      : null;
  const mockMeta = await resolveMockMetaServer(authCookies, mockSlug);

  return (
    <MockLayout>
      <ReadingPage
        key={`${passage}-${sp.mock_attempt ?? "solo"}`}
        testId={mockTestId}
        mockSlug={canonicalMockSlug(mockSlug)}
        mockMeta={mockMeta}
        passage={passage}
        autoStart={autoStart}
        initialBoot={initialBoot}
      />
    </MockLayout>
  );
}
