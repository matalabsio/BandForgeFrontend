import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import type { ListeningScoreReport } from "@/modules/listening/types";

export const metadata = { title: "Listening result" };

type PageProps = {
  params: Promise<{ mockTestId: string; attemptId: string }>;
};

async function getReport(
  attemptId: string,
  cookieHeader: string,
): Promise<{ report: ListeningScoreReport | null; status: number }> {
  const base = getApiUrl();
  try {
    const res = await fetch(
      `${base}/api/listening/attempts/${encodeURIComponent(attemptId)}/score-report`,
      {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return { report: null, status: res.status };
    }
    const json = (await res.json()) as ListeningScoreReport;
    return { report: json, status: res.status };
  } catch {
    return { report: null, status: 0 };
  }
}

function bandLabel(band: number): string {
  if (band <= 0) return "—";
  return band.toFixed(1);
}

export default async function ListeningResultsPage({ params }: PageProps) {
  const { mockTestId, attemptId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) {
    redirect(
      authBootstrapPath(
        `/mock/${encodeURIComponent(mockTestId)}/listening/results/${encodeURIComponent(attemptId)}`,
      ),
    );
  }
  const { report, status } = await getReport(attemptId, cookieHeader);

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <header className="border-b border-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-bold text-navy">
            Band<span className="text-teal">Forge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-meta font-semibold text-teal hover:text-teal-light"
            >
              Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-meta font-semibold uppercase tracking-wider text-teal">
          Listening result
        </p>
        <h1 className="mt-2 font-display text-h2 text-navy">Your band score</h1>
        <p className="mt-2 text-[12px] text-ink/55">Attempt {attemptId}</p>

        {!report ? (
          <div className="mt-8 rounded-2xl border border-danger/30 bg-danger/5 p-6">
            <h2 className="text-h4 text-navy">No report available</h2>
            <p className="mt-2 text-body text-ink/70">
              {status === 404
                ? "This attempt has not been scored yet (or was not a listening attempt)."
                : status === 403
                  ? "You do not have access to this attempt."
                  : "Could not load score report. Please try again."}
            </p>
            <Link
              href={`/mock/${encodeURIComponent(mockTestId)}/listening`}
              className="mt-4 inline-flex rounded-xl border border-border bg-white px-4 py-2 text-meta font-semibold text-navy hover:bg-surface"
            >
              Back to listening
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <p className="text-meta text-ink/55">Band</p>
                <p className="mt-1 font-display text-h1 text-navy">
                  {bandLabel(report.band)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <p className="text-meta text-ink/55">Raw score</p>
                <p className="mt-1 font-display text-h1 text-navy">
                  {report.raw_score}
                  <span className="text-body text-ink/55">
                    {" "}
                    / {report.total_questions}
                  </span>
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <p className="text-meta text-ink/55">Submission</p>
                <p
                  className={`mt-1 font-display text-h3 ${
                    report.late_submission ? "text-danger" : "text-navy"
                  }`}
                >
                  {report.late_submission ? "Late" : "On time"}
                </p>
                {report.submitted_at ? (
                  <p className="mt-1 text-[12px] text-ink/55">
                    {new Date(report.submitted_at).toLocaleString()}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-h4 text-navy">Skill breakdown</h2>
              <p className="mt-1 text-meta text-ink/55">
                Per-skill accuracy from your tagged questions.
              </p>
              {Object.keys(report.skill_breakdown).length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-meta text-ink/55">
                  No skill tags configured for this mock.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {Object.entries(report.skill_breakdown).map(([skill, entry]) => {
                    const pct = Math.round(entry.pct * 100);
                    return (
                      <li key={skill}>
                        <div className="flex items-center justify-between text-meta">
                          <span className="font-semibold capitalize text-navy">
                            {skill.replaceAll("_", " ")}
                          </span>
                          <span className="tabular-nums text-ink/70">
                            {entry.correct}/{entry.total} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface">
                          <div
                            className="h-full bg-teal"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/mock/${encodeURIComponent(mockTestId)}/listening`}
                className="rounded-xl border border-border bg-white px-4 py-2 text-meta font-semibold text-navy hover:bg-surface"
              >
                Take again
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl bg-teal px-4 py-2 text-meta font-semibold text-white hover:bg-teal-light"
              >
                Back to dashboard
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
