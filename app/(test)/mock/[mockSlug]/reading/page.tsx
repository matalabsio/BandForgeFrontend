import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reading · BandForge",
  robots: { index: false, follow: false },
};
import { mockApiId, mockModulePath } from "@/lib/mock-catalog";
import { ensureCanonicalMockSlug } from "@/lib/mock-route-guard";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { fetchReadingBootServer } from "@/lib/mock-server";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { ReadingPage } from "@/modules/reading/components/reading-page";
import { MockLayout } from "@/modules/mock/components/mock-layout";

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{ passage?: string; mock_attempt?: string; auto?: string }>;
};

export default async function MockReadingPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  const passage = sp.passage ? Number.parseInt(sp.passage, 10) : 1;
  const autoStart = sp.auto === "1" || sp.auto === "true";

  ensureCanonicalMockSlug(mockSlug, (slug) =>
    mockModulePath(slug, "reading", { passage }),
  );

  const mockTestId = mockApiId(mockSlug);
  const cookieHeader = await getCachedCookieHeader();
  const returnPath = mockModulePath(mockSlug, "reading", {
    passage,
    mockAttemptId: sp.mock_attempt,
    auto: autoStart || Boolean(sp.mock_attempt) || undefined,
  });
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

  return (
    <MockLayout>
      <ReadingPage
        key={`${passage}-${sp.mock_attempt ?? "solo"}`}
        testId={mockTestId}
        mockSlug={mockSlug}
        passage={passage}
        autoStart={autoStart}
        initialBoot={initialBoot}
      />
    </MockLayout>
  );
}
