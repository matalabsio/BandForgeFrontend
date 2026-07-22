import { AlertCircle } from "lucide-react";
import { CriteriaVsTargetBars } from "@/modules/speaking/components/report/criteria-vs-target-bars";
import type { SpeakingFeedback } from "@/modules/speaking/types";

type Props = {
  feedback: SpeakingFeedback;
};

function metricDisplay(
  key: string,
  value: number | string | boolean | null | undefined,
): string {
  if (value == null) return "—";
  if (key === "total_speaking_seconds" && typeof value === "number") {
    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60);
    return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, "0")}` : `${seconds}s`;
  }
  return String(value);
}

export function ReportSummaryRail({ feedback }: Props) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start" aria-label="Score summary">
      <section aria-labelledby="criteria-heading">
        <h2 id="criteria-heading" className="font-mono text-[11px] tracking-[0.12em] text-muted-light uppercase">
          Criteria vs target
        </h2>
        <CriteriaVsTargetBars
          className="mt-3"
          targetBand={feedback.targetBand}
          criteria={feedback.criteria.map((criterion) => ({
            key: criterion.key,
            shortLabel: criterion.shortLabel,
            label: criterion.label,
            band: criterion.band,
            targetGap: criterion.targetGap,
          }))}
        />
      </section>

      {feedback.biggestGap ? (
        <section className="flex gap-3 rounded-2xl border border-amber-200 border-l-[3px] border-l-amber-500 bg-amber-50 p-4" aria-label="Biggest target gap">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <p className="text-[13px] leading-relaxed text-navy">
            <strong>{feedback.biggestGap.label}</strong> is your biggest recorded gap
            {feedback.biggestGap.targetGap == null
              ? "."
              : ` at ${feedback.biggestGap.targetGap.toFixed(1)} band points below target. Closing it is the clearest route toward Band ${feedback.targetBand?.toFixed(1) ?? "your target"}.`}
          </p>
        </section>
      ) : null}

      <section aria-labelledby="fluency-heading">
        <h2 id="fluency-heading" className="font-mono text-[11px] tracking-[0.12em] text-muted-light uppercase">
          Fluency stats
        </h2>
        {(() => {
          const overall = feedback.fluencySummary.overall;
          const attempted =
            overall?.response_count != null && overall?.questions_asked != null
              ? `${overall.response_count}/${overall.questions_asked}`
              : "—";
          const items = [
            ["WPM · P1", metricDisplay("words_per_minute", feedback.fluencySummary.parts["1"]?.words_per_minute)],
            ["WPM · P2", metricDisplay("words_per_minute", feedback.fluencySummary.parts["2"]?.words_per_minute)],
            ["WPM · P3", metricDisplay("words_per_minute", feedback.fluencySummary.parts["3"]?.words_per_minute)],
            ["Total speaking", metricDisplay("total_speaking_seconds", overall?.total_speaking_seconds)],
            ["Pauses >2s", metricDisplay("long_pauses", overall?.long_pauses)],
            ["Attempted", attempted],
          ] as const;
          return (
            <dl className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {items.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-border-soft bg-white p-3 text-center shadow-soft"
                >
                  <dt className="text-[10px] font-semibold tracking-wide text-muted-light uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-medium tabular-nums text-navy">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          );
        })()}
      </section>

      <section aria-labelledby="parts-heading">
        <h2 id="parts-heading" className="font-mono text-[11px] tracking-[0.12em] text-muted-light uppercase">
          By part
        </h2>
        {feedback.parts.length > 0 ? (
          <div className="mt-3 space-y-2.5">
            {feedback.parts.map((part) => (
              <article key={part.part} className="rounded-2xl border border-border-soft bg-white p-4 shadow-soft">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-[15px] font-bold text-navy">
                    Part {part.part} · {part.label}
                  </h3>
                  {part.band_estimate != null ? (
                    <span className="font-mono text-sm font-medium text-cyan">
                      ≈{part.band_estimate.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                {part.note ? (
                  <p className="mt-2 text-xs leading-relaxed text-muted">{part.note}</p>
                ) : (
                  <p className="mt-2 text-xs text-muted-light">No examiner note was provided for this part.</p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-border-soft bg-white p-4 text-xs text-muted" aria-live="polite">
            Part summaries are unavailable for this report.
          </p>
        )}
      </section>
    </aside>
  );
}
