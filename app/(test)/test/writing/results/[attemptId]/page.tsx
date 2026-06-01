import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import type { WritingReview } from "@/modules/writing/types";
import { WritingResultsView } from "@/modules/writing/components/writing-results-view";
import { writingTestHubPath } from "@/lib/writing-test";

export const metadata = { title: "Writing — saved for review" };

type PageProps = {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ mock_attempt?: string }>;
};

async function loadReview(
  attemptId: string,
  cookieHeader: string,
): Promise<WritingReview | null> {
  const base = getApiUrl();
  try {
    const res = await fetch(
      `${base}/api/writing/attempts/${encodeURIComponent(attemptId)}/review`,
      {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as WritingReview;
  } catch {
    return null;
  }
}

export default async function WritingResultsPage({
  params,
  searchParams,
}: PageProps) {
  const { attemptId } = await params;
  const sp = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) {
    redirect(authBootstrapPath(`/test/writing/results/${attemptId}`));
  }

  const review = await loadReview(attemptId, cookieHeader);
  if (!review) {
    return (
      <div className="min-h-dvh bg-surface p-8 text-center">
        <p className="text-[14px] text-red-600">Could not load your saved essay.</p>
        <Link href={writingTestHubPath()} className="mt-4 inline-block text-teal">
          Back to writing
        </Link>
      </div>
    );
  }

  const showContinueTask2 = review.part === 1 && !sp.mock_attempt;

  return (
    <div className="bf-page-shell min-h-dvh text-ink">
      <header className="border-b border-border bg-white px-4 py-3 sm:px-6">
        <BandForgeLogoLink size="sm" />
      </header>
      <main>
        <WritingResultsView
          review={review}
          mockAttemptId={sp.mock_attempt ?? null}
          showContinueTask2={showContinueTask2}
        />
      </main>
    </div>
  );
}
