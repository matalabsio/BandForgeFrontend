import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reading · BandForge",
  robots: { index: false, follow: false },
};
import { authBootstrapPath } from "@/lib/auth";
import { mockApiId, mockModulePath } from "@/lib/mock-catalog";
import { ensureCanonicalMockSlug } from "@/lib/mock-route-guard";
import { fetchReadingBootServer } from "@/lib/mock-server";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { ReadingPage } from "@/modules/reading/components/reading-page";
import { MockLayout } from "@/modules/mock/components/mock-layout";

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{ passage?: string; mock_attempt?: string }>;
};

export default async function MockReadingPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  const passage = sp.passage ? Number.parseInt(sp.passage, 10) : 1;
  const mockAttemptId = sp.mock_attempt ?? null;

  ensureCanonicalMockSlug(mockSlug, (slug) =>
    mockModulePath(slug, "reading", { passage }),
  );

  const mockTestId = mockApiId(mockSlug);
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authBootstrapPath(mockModulePath(mockSlug, "reading", { passage })));
  }

  const initialBoot =
    mockAttemptId != null
      ? await fetchReadingBootServer(
          cookieHeader,
          mockTestId,
          passage,
          mockAttemptId,
        )
      : null;

  return (
    <MockLayout>
      <ReadingPage
        testId={mockTestId}
        mockSlug={mockSlug}
        passage={passage}
        autoStart
        initialBoot={initialBoot}
      />
    </MockLayout>
  );
}
