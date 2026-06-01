import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Listening · BandForge",
  robots: { index: false, follow: false },
};
import { authBootstrapPath } from "@/lib/auth";
import { mockApiId, mockModulePath } from "@/lib/mock-catalog";
import { ensureCanonicalMockSlug } from "@/lib/mock-route-guard";
import { fetchListeningBootServer } from "@/lib/mock-server";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { ListeningPage } from "@/modules/listening/components/listening-page";
import { MockLayout } from "@/modules/mock/components/mock-layout";

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{ part?: string; mock_attempt?: string }>;
};

export default async function MockListeningPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  const part = sp.part ? Number.parseInt(sp.part, 10) : 1;
  const mockAttemptId = sp.mock_attempt ?? null;

  ensureCanonicalMockSlug(mockSlug, (slug) =>
    mockModulePath(slug, "listening", { part }),
  );

  const mockTestId = mockApiId(mockSlug);
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authBootstrapPath(mockModulePath(mockSlug, "listening", { part })));
  }

  const initialBoot =
    mockAttemptId != null
      ? await fetchListeningBootServer(
          cookieHeader,
          mockTestId,
          part,
          mockAttemptId,
        )
      : null;

  return (
    <MockLayout>
      <ListeningPage
        testId={mockTestId}
        mockSlug={mockSlug}
        part={part}
        variant="exam"
        initialBoot={initialBoot}
      />
    </MockLayout>
  );
}
