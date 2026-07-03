import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Section results · BandForge",
  robots: { index: false, follow: false },
};
import { resolveAuthRedirectPath } from "@/lib/auth";
import { mockHubPath } from "@/lib/mock-catalog";
import { ensureCanonicalMockHub } from "@/lib/mock-route-guard";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";
import { MockCheckpoint } from "@/modules/mock/components/mock-checkpoint";
import { MockLayout } from "@/modules/mock/components/mock-layout";

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{
    mock_attempt?: string;
    attempt?: string;
    from?: string;
  }>;
};

export default async function MockCheckpointPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  ensureCanonicalMockHub(mockSlug);

  const sp = await searchParams;
  const mockAttemptId = sp.mock_attempt;
  const attemptId = sp.attempt;

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  if (!user) {
    redirect(resolveAuthRedirectPath(mockHubPath(mockSlug), cookieHeader));
  }

  if (!mockAttemptId || !attemptId) {
    redirect(mockHubPath(mockSlug));
  }

  const from =
    sp.from === "reading" || sp.from === "listening" ? sp.from : undefined;

  return (
    <MockLayout>
      <MockCheckpoint
        mockSlug={mockSlug}
        mockAttemptId={mockAttemptId}
        attemptId={attemptId}
        from={from}
      />
    </MockLayout>
  );
}
