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
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { SpeakingPage } from "@/modules/speaking/components/speaking-page";

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{
    mock_attempt?: string;
    auto?: string;
    section_start?: string;
  }>;
};

export default async function MockSpeakingPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;

  const mockTestId = mockApiId(mockSlug);
  const testNumber = testNumberForMockId(mockTestId);
  const autoStart =
    sp.auto === "1" || sp.auto === "true" || Boolean(sp.mock_attempt);
  const sectionStart = sp.section_start === "1";

  if (isLiveCatalogTestNumber(testNumber)) {
    redirect(
      legacyModuleExamRedirectPath(testNumber, "speaking", {
        auto: autoStart,
        sectionStart,
        mockAttemptId: sp.mock_attempt,
      }),
    );
  }

  ensureCanonicalMockSlug(mockSlug, (slug) => mockModulePath(slug, "speaking"));

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, mockModulePath(mockSlug, "speaking"));
  const mockMeta = await resolveMockMetaServer(cookieHeader, mockSlug);

  return (
    <MockLayout>
      <SpeakingPage
        mockTestId={mockTestId}
        mockSlug={canonicalMockSlug(mockSlug)}
        mockMeta={mockMeta}
        testNumber={testNumber}
      />
    </MockLayout>
  );
}
