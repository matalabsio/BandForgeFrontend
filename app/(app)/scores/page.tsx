import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ScoresContentSkeleton } from "@/components/scores/scores-content-skeleton";
import { ScoresExperience } from "@/components/scores/scores-experience";
import { authGuardRedirectPath } from "@/lib/auth";
import {
  canonicalMockSlug,
  PUBLISHED_MOCK_SLUGS,
  type MockSlug,
} from "@/lib/mock-catalog";
import {
  getCachedCookieHeader,
  getCachedDashboardSummary,
  getCachedServerUser,
} from "@/lib/server-cache";
import { fetchLearningProfile } from "@/lib/learning-server";

export const metadata = {
  title: "Performance · BandForge",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ attempt?: string; fresh?: string; mock?: string }>;
};

async function ScoresPageContent({ searchParams }: PageProps) {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authGuardRedirectPath("/scores", cookieHeader));
  }

  const sp = await searchParams;
  const highlightAttemptId = sp.attempt?.trim() || null;
  const fresh = sp.fresh === "1";
  const mockParam = sp.mock?.trim();
  const resolvedMock = mockParam ? (canonicalMockSlug(mockParam) as MockSlug) : null;
  const mockSlug =
    resolvedMock && PUBLISHED_MOCK_SLUGS.includes(resolvedMock) ? resolvedMock : null;

  const [summary, learning] = await Promise.all([
    getCachedDashboardSummary(cookieHeader),
    fetchLearningProfile(cookieHeader),
  ]);

  const profileTarget =
    learning?.target_band ??
    (user.target_band !== null && user.target_band !== undefined
      ? user.target_band
      : null);

  return (
    <ScoresExperience
      summary={summary}
      profileTargetBand={profileTarget}
      fresh={fresh}
      highlightAttemptId={highlightAttemptId}
      mockSlug={mockSlug}
      recommendations={learning?.recommendations ?? []}
      topWeaknesses={learning?.top_weaknesses ?? []}
      learning={learning}
    />
  );
}

export default function ScoresPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<ScoresContentSkeleton />}>
      <ScoresPageContent searchParams={searchParams} />
    </Suspense>
  );
}
