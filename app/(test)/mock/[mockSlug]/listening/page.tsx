import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Listening · BandForge",
  robots: { index: false, follow: false },
};
import { mockApiId, mockModulePath } from "@/lib/mock-catalog";
import { ensureCanonicalMockSlug } from "@/lib/mock-route-guard";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { ListeningPage } from "@/modules/listening/components/listening-page";
import { MockLayout } from "@/modules/mock/components/mock-layout";

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{ part?: string; mock_attempt?: string; auto?: string }>;
};

export default async function MockListeningPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  const part = sp.part ? Number.parseInt(sp.part, 10) : 1;
  const autoStart = sp.auto === "1" || sp.auto === "true";

  ensureCanonicalMockSlug(mockSlug, (slug) =>
    mockModulePath(slug, "listening", { part }),
  );

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(
    cookieHeader,
        mockModulePath(mockSlug, "listening", {
          part,
          mockAttemptId: sp.mock_attempt,
          auto: autoStart || Boolean(sp.mock_attempt) || undefined,
        }),
  );
  const mockTestId = mockApiId(mockSlug);

  return (
    <MockLayout>
      <ListeningPage
        testId={mockTestId}
        mockSlug={mockSlug}
        part={part}
        variant="exam"
      />
    </MockLayout>
  );
}
