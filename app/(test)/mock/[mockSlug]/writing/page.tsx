import { redirect } from "next/navigation";
import { authBootstrapPath } from "@/lib/auth";
import { mockApiId, mockModulePath } from "@/lib/mock-catalog";
import { ensureCanonicalMockSlug } from "@/lib/mock-route-guard";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { fetchWritingBootServer } from "@/lib/mock-server";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { WritingPage } from "@/modules/writing/components/writing-page";

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{ part?: string; mock_attempt?: string; auto?: string }>;
};

export default async function MockWritingPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  const part = sp.part ? Number.parseInt(sp.part, 10) : 1;
  if (part !== 1 && part !== 2) {
    redirect(mockModulePath(mockSlug, "writing", { part: 1 }));
  }

  ensureCanonicalMockSlug(mockSlug, (slug) =>
    mockModulePath(slug, "writing", { part }),
  );

  const mockTestId = mockApiId(mockSlug);
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(
      authBootstrapPath(
        mockModulePath(mockSlug, "writing", {
          part,
          mockAttemptId: sp.mock_attempt,
        }),
      ),
    );
  }

  const mockAttemptId = sp.mock_attempt ?? null;
  const initialBoot =
    mockAttemptId != null
      ? await fetchWritingBootServer(
          cookieHeader,
          mockTestId,
          part,
          mockAttemptId,
        )
      : null;

  return (
    <MockLayout>
      <WritingPage
        mockTestId={mockTestId}
        mockSlug={mockSlug}
        part={part}
        autoStart={sp.auto === "1" || sp.auto === "true"}
        initialBoot={initialBoot}
      />
    </MockLayout>
  );
}
