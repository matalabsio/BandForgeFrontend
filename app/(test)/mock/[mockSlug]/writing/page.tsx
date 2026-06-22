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
import { WritingPage } from "@/modules/writing/components/writing-page";

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{
    part?: string;
    mock_attempt?: string;
    auto?: string;
    section_start?: string;
  }>;
};

export default async function MockWritingPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  const part = sp.part ? Number.parseInt(sp.part, 10) : 1;
  if (part !== 1 && part !== 2) {
    redirect(mockModulePath(mockSlug, "writing", { part: 1 }));
  }

  const mockTestId = mockApiId(mockSlug);
  const testNumber = testNumberForMockId(mockTestId);
  const autoStart =
    sp.auto === "1" || sp.auto === "true" || Boolean(sp.mock_attempt);
  const sectionStart = sp.section_start === "1";

  if (isLiveCatalogTestNumber(testNumber)) {
    redirect(
      legacyModuleExamRedirectPath(testNumber, "writing", {
        part,
        auto: autoStart,
        sectionStart,
        mockAttemptId: sp.mock_attempt,
      }),
    );
  }

  ensureCanonicalMockSlug(mockSlug, (slug) =>
    mockModulePath(slug, "writing", { part }),
  );

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(
    cookieHeader,
    mockModulePath(mockSlug, "writing", { part }),
  );
  const mockMeta = await resolveMockMetaServer(cookieHeader, mockSlug);

  return (
    <MockLayout>
      <WritingPage
        mockTestId={mockTestId}
        mockSlug={canonicalMockSlug(mockSlug)}
        mockMeta={mockMeta}
        part={part}
        autoStart={autoStart}
      />
    </MockLayout>
  );
}
