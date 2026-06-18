import Link from "next/link";
import type { ListeningScoreReport } from "@/modules/listening/types";
import { formatDateTime } from "@/lib/date-format";
import { listeningTestPath } from "@/lib/listening-test";
import { QuestionReviewList } from "@/components/scores/question-review-list";
import { SkillBar } from "@/components/scores/skill-bar";

function bandLabel(band: number): string {
  if (band <= 0) return "—";
  return band.toFixed(1);
}

type Props = {
  attemptId: string;
  report: ListeningScoreReport | null;
  status: number;
  backHref?: string;
  retakeHref?: string;
  scoresHref?: string;
  scoresLabel?: string;
};

export function ListeningResultsView({
  attemptId,
  report,
  status,
  backHref = listeningTestPath(),
  retakeHref = listeningTestPath(),
  scoresHref = "/scores",
  scoresLabel = "View performance",
}: Props) {
  const moduleLabel = report?.module === "listening" ? "Listening" : "Test";
  const title = report?.test_title?.trim();

  return (
    <>
      <p className="text-meta font-semibold uppercase tracking-wider text-teal">
        {moduleLabel} result
      </p>
      <h1 className="mt-2 font-display text-h2 text-navy">
        {title ? `${title}` : "Your band score"}
      </h1>
      <p className="mt-1 text-h4 font-display text-teal">
        {report ? `${moduleLabel} Band ${bandLabel(report.band)}` : null}
      </p>

      {!report ? (
        <div className="mt-8 rounded-2xl border border-danger/30 bg-danger/5 p-6">
          <h2 className="text-h4 text-navy">No report available</h2>
          <p className="mt-2 text-body text-ink/70">
            {status === 404
              ? "This attempt has not been scored yet (or was not a listening attempt)."
              : "Could not load score report. Please try again."}
          </p>
          <Link
            href={backHref}
            className="mt-4 inline-flex rounded-xl border border-border bg-white px-4 py-2 text-meta font-semibold text-navy hover:bg-surface"
          >
            Back to listening test
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
                  / {report.total_questions} correct
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
                  {formatDateTime(report.submitted_at)}
                </p>
              ) : null}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-h4 text-navy">Skill breakdown</h2>
            <p className="mt-1 text-meta text-ink/55">
              Green ≥70% · Amber 50–70% · Red below 50%
            </p>
            {Object.keys(report.skill_breakdown).length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-meta text-ink/55">
                No skill tags configured for this test.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {Object.entries(report.skill_breakdown).map(([skill, entry]) => (
                  <SkillBar key={skill} skill={skill} entry={entry} />
                ))}
              </ul>
            )}
          </section>

          {report.practice_tip ? (
            <section className="mt-6 rounded-2xl border border-teal/30 bg-teal/5 p-6">
              <h2 className="text-h4 text-navy">What to practise next</h2>
              <p className="mt-3 text-body leading-relaxed text-ink/80">
                {report.practice_tip}
              </p>
            </section>
          ) : null}

          {report.questions && report.questions.length > 0 ? (
            <section className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-h4 text-navy">Question review</h2>
              <p className="mt-1 text-meta text-ink/55">
                Tap a question to see your answer, the key, and a short note.
              </p>
              <QuestionReviewList questions={report.questions} />
            </section>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={retakeHref}
              className="rounded-xl bg-teal px-5 py-2.5 text-meta font-semibold text-white hover:bg-cyan-light"
            >
              Start next test
            </Link>
            <Link
              href={scoresHref}
              className="rounded-xl border border-border bg-white px-4 py-2 text-meta font-semibold text-navy hover:bg-surface"
            >
              {scoresLabel}
            </Link>
          </div>
        </>
      )}
    </>
  );
}
