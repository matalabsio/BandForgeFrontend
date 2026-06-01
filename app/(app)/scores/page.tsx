import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ScoresContentSkeleton } from "@/components/scores/scores-content-skeleton";
import { ScoresExperience } from "@/components/scores/scores-experience";
import { authGuardRedirectPath } from "@/lib/auth";
import {
  getCachedCookieHeader,
  getCachedDashboardSummary,
  getCachedServerUser,
} from "@/lib/server-cache";

export const metadata = {
  title: "Performance · BandForge",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ attempt?: string; fresh?: string }>;
};

async function ScoresPageContent({ searchParams }: PageProps) {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authGuardRedirectPath("/scores"));
  }

  const sp = await searchParams;
  const highlightAttemptId = sp.attempt?.trim() || null;
  const fresh = sp.fresh === "1";

  const summary = await getCachedDashboardSummary(cookieHeader);

  const profileTarget =
    user.target_band !== null && user.target_band !== undefined
      ? user.target_band
      : null;

  return (
    <ScoresExperience
      summary={summary}
      profileTargetBand={profileTarget}
      fresh={fresh}
      highlightAttemptId={highlightAttemptId}
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
