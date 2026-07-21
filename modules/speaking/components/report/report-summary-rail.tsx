import { AlertCircle } from "lucide-react";
import type { SpeakingFeedback } from "@/modules/speaking/types";

type Props = {
  feedback: SpeakingFeedback;
};

function deltaLabel(delta: number | null): string {
  if (delta == null) return "Target unavailable";
  if (delta <= 0) return "On target";
  return `−${delta.toFixed(1)} to target`;
}

export function ReportSummaryRail({ feedback }: Props) {
  const targetPosition =
    feedback.targetBand == null
      ? null
      : `${Math.min(100, Math.max(0, (feedback.targetBand / 9) * 100))}%`;

  return (
    <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start" aria-label="Score summary">
      <section aria-labelledby="criteria-heading">
        <h2 id="criteria-heading" className="font-mono text-[11px] tracking-[0.12em] text-muted-light uppercase">
          Criteria vs target
        </h2>
        <div className="mt-3 space-y-5 rounded-2xl border border-border-soft bg-white p-4 shadow-soft sm:p-5">
          {feedback.criteria.map((criterion) => (
            <div key={criterion.key}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-[10px] font-semibold text-teal" aria-hidden="true">
                    {criterion.shortLabel}
                  </span>
                  <span className="ml-2 text-xs font-semibold text-navy">
                    {criterion.label}
                  </span>
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] tabular-nums">
                  <strong className="text-sm font-semibold text-navy">{criterion.band.toFixed(1)}</strong>
                  <span className={criterion.targetGap != null && criterion.targetGap > 0 ? "ml-1.5 text-warning" : "ml-1.5 text-success"}>
                    {deltaLabel(criterion.targetGap)}
                  </span>
                </div>
              </div>
              <div
                className="relative h-2.5 overflow-visible rounded-full bg-slate-100"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={9}
                aria-valuenow={criterion.band}
                aria-label={`${criterion.label}, Band ${criterion.band.toFixed(1)}${feedback.targetBand == null ? "" : `, target Band ${feedback.targetBand.toFixed(1)}`}`}
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal to-cyan"
                  style={{ width: `${Math.min(100, Math.max(0, (criterion.band / 9) * 100))}%` }}
                  aria-hidden="true"
                />
                {targetPosition ? (
                  <span
                    className="pointer-events-none absolute -top-1 h-[18px] w-0.5 -translate-x-1/2 rounded-full bg-amber-500"
                    style={{ left: targetPosition }}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            </div>
          ))}
          {feedback.targetBand != null ? (
            <p className="flex items-center gap-2 text-[11px] text-muted">
              <span className="h-0.5 w-3 rounded-full bg-amber-500" aria-hidden="true" />
              Target Band {feedback.targetBand.toFixed(1)}
            </p>
          ) : (
            <p className="text-[11px] text-muted">No target band was set for this report.</p>
          )}
        </div>
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
