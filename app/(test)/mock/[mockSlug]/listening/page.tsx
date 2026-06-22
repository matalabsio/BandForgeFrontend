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
import { getCachedCookieHeader } from "@/lib/server-cache";
import { resolveMockMetaServer } from "@/lib/mock-server";
import { ListeningPage } from "@/modules/listening/components/listening-page";
import { MockLayout } from "@/modules/mock/components/mock-layout";

export const metadata: Metadata = {
  title: "Listening · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{
    part?: string;
    mock_attempt?: string;
    auto?: string;
    section_start?: string;
  }>;
};

export default async function MockListeningPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  const part = sp.part ? Number.parseInt(sp.part, 10) : 1;
  const mockTestId = mockApiId(mockSlug);
  const testNumber = testNumberForMockId(mockTestId);
  const autoStart =
    sp.auto === "1" || sp.auto === "true" || Boolean(sp.mock_attempt);
  const sectionStart = sp.section_start === "1";

  if (isLiveCatalogTestNumber(testNumber)) {
    redirect(
      legacyModuleExamRedirectPath(testNumber, "listening", {
        part,
        auto: autoStart,
        sectionStart,
        mockAttemptId: sp.mock_attempt,
      }),
    );
  }

  ensureCanonicalMockSlug(mockSlug, (slug) =>
    mockModulePath(slug, "listening", { part }),
  );

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(
    cookieHeader,
    mockModulePath(mockSlug, "listening", { part }),
  );
  const mockMeta = await resolveMockMetaServer(cookieHeader, mockSlug);

  return (
    <MockLayout>
      <ListeningPage
        testId={mockTestId}
        mockSlug={canonicalMockSlug(mockSlug)}
        mockMeta={mockMeta}
        part={part}
        variant="exam"
      />
    </MockLayout>
  );
}
