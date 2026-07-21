import { ShieldCheck } from "lucide-react";
import type { SpeakingFeedback } from "@/modules/speaking/types";
import { ReportAnalysis } from "@/modules/speaking/components/report/report-analysis";
import { ReportFindings } from "@/modules/speaking/components/report/report-findings";
import { ReportSummaryRail } from "@/modules/speaking/components/report/report-summary-rail";
import { SpeakingReportActions } from "@/modules/speaking/components/report/speaking-report-actions";

type Props = {
  testNumber: number;
  feedback: SpeakingFeedback;
};

function dateLabel(value: string | null): string {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

export function SpeakingFeedbackView({ testNumber, feedback }: Props) {
  const title =
    feedback.attempt.mock_title?.trim() ||
    `Mock Test ${feedback.attempt.test_number ?? testNumber}`;
  const reviewer = feedback.release.reviewer;

  return (
    <div className="speaking-report min-h-dvh overflow-x-hidden bg-white text-ink">
      <header className="border-b border-border-soft bg-white">
        <div className="mx-auto flex min-h-[70px] w-full max-w-[1240px] flex-col justify-center gap-2 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8 lg:px-10">
          <div className="flex items-end gap-2" aria-label="BandForge">
            <span className="flex h-5 items-end gap-[3px]" aria-hidden>
              {[40, 60, 80, 100].map((height) => (
                <span key={height} className="w-1 rounded-sm bg-cyan" style={{ height: `${height}%` }} />
              ))}
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-navy">
              Band<span className="text-cyan">Forge</span>
            </span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.1em] text-muted uppercase sm:text-xs">
            {title} · Speaking ·{" "}
            <time dateTime={feedback.attempt.submitted_at ?? undefined}>
              {dateLabel(feedback.attempt.submitted_at)}
            </time>
          </p>
        </div>
      </header>

      <SpeakingReportActions />

      <main>
        <section className="border-b border-border-soft bg-surface-alt px-4 py-7 sm:px-6 sm:py-9 md:px-8 lg:px-10" aria-labelledby="report-title">
          <div className="mx-auto w-full max-w-[1240px]">
            <div className="mb-5">
              <p className="font-mono text-[10px] tracking-[0.14em] text-teal uppercase">
                Score report
              </p>
              <h1 id="report-title" className="mt-1 font-display text-xl font-bold tracking-tight text-navy sm:text-2xl">
                Your Speaking evaluation
              </h1>
            </div>
            <div
              className="mx-auto flex max-w-2xl flex-col items-center rounded-[22px] border border-cyan/20 bg-[radial-gradient(120%_140%_at_50%_-20%,rgba(0,151,167,0.3),rgba(13,31,60,0)_60%)] bg-navy px-5 py-7 text-center shadow-[0_20px_50px_rgba(13,31,60,0.2)] sm:px-8 sm:py-9"
              aria-label={`Overall Speaking Band ${feedback.overallBand.toFixed(1)}, ${feedback.descriptor}`}
            >
              <p className="font-display text-[4.5rem] leading-none font-extrabold tracking-[-0.05em] text-white tabular-nums sm:text-[5.5rem]" aria-hidden="true">
                {feedback.overallBand.toFixed(1)}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[#B8C6D9] uppercase" aria-hidden="true">
                Overall band
              </p>
              <p className="mt-1 text-sm font-semibold text-cyan" aria-hidden="true">
                {feedback.descriptor}
              </p>
              {feedback.release.human_verified ? (
                <div className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 text-xs font-semibold text-emerald-300">
                  <ShieldCheck className="size-4" aria-hidden />
                  Verified by a human examiner
                </div>
              ) : null}
              {reviewer ? (
                <p className="mt-3 text-xs text-[#B8C6D9]">
                  Reviewed by {reviewer.display_name}
                  {reviewer.credential_label ? ` · ${reviewer.credential_label}` : ""}
                </p>
              ) : null}
              {feedback.release.released_at ? (
                <p className="mt-1 text-[11px] text-[#9FB0C8]">
                  Released{" "}
                  <time dateTime={feedback.release.released_at}>
                    {dateLabel(feedback.release.released_at)}
                  </time>
                  {" · "}Approval v{feedback.release.approval_version}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 py-8 sm:px-6 md:px-8 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:items-start lg:px-10 lg:py-10">
          <ReportSummaryRail feedback={feedback} />
          <div className="min-w-0">
            <ReportAnalysis parts={feedback.parts} fluency={feedback.fluencySummary} />
            <ReportFindings feedback={feedback} />
          </div>
        </div>
      </main>
    </div>
  );
}
