import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import { ListeningResultsView } from "@/modules/listening/components/listening-results-view";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import { readingResultsPath, readingTestHubPath } from "@/lib/reading-test";
import type { ReadingScoreReport } from "@/modules/reading/types";

export const metadata = { title: "Reading result" };

type PageProps = { params: Promise<{ attemptId: string }> };

async function getReport(
  attemptId: string,
  cookieHeader: string,
): Promise<{ report: ReadingScoreReport | null; status: number }> {
  const base = getApiUrl();
  try {
    const res = await fetch(
      `${base}/api/reading/attempts/${encodeURIComponent(attemptId)}/score-report`,
      {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      },
    );
    if (!res.ok) return { report: null, status: res.status };
    const json = (await res.json()) as ReadingScoreReport;
    return { report: json, status: res.status };
  } catch {
    return { report: null, status: 0 };
  }
}

export default async function ReadingTestResultsPage({ params }: PageProps) {
  const { attemptId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) {
    redirect(authBootstrapPath(readingResultsPath(attemptId)));
  }
  const { report, status } = await getReport(attemptId, cookieHeader);

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <header className="border-b border-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <BandForgeLogoLink size="md" />
          <div className="flex items-center gap-3">
            <Link
              href="/scores"
              className="text-meta font-semibold text-teal hover:text-teal-light"
            >
              All scores
            </Link>
            <Link
              href={readingTestHubPath()}
              className="text-meta font-semibold text-navy/70 hover:text-navy"
            >
              Reading hub
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <ListeningResultsView
          attemptId={attemptId}
          report={report}
          status={status}
          backHref={readingTestHubPath()}
          retakeHref={readingTestHubPath()}
          scoresHref="/scores"
          scoresLabel="View performance"
        />
      </main>
    </div>
  );
}
