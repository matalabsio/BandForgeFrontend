import { ShieldCheck } from "lucide-react";
import type { WritingFeedback } from "@/modules/writing/types";

function bandDisplay(band: number): string {
  if (band <= 0) return "—";
  return band.toFixed(1);
}

type Props = {
  part: number;
  taskTitle: string;
  feedback: WritingFeedback;
  showVerifiedBadge?: boolean;
};

export function ScoreHero({
  part,
  taskTitle,
  feedback,
  showVerifiedBadge = true,
}: Props) {
  return (
    <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[0.6875rem] tracking-wide text-cyan uppercase">
          Task {part} · Writing
        </p>
        {showVerifiedBadge && feedback.human_verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFEFF] px-2 py-0.5 text-[10px] font-semibold text-teal">
            <ShieldCheck className="size-3" aria-hidden />
            Human verified
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-start gap-5 sm:gap-6">
        <div className="shrink-0">
          <p className="font-display text-5xl leading-none font-bold text-cyan tabular-nums sm:text-6xl">
            {bandDisplay(feedback.overall_band)}
          </p>
          <p className="mt-2 font-mono text-[0.625rem] tracking-[0.14em] text-muted-light uppercase">
            Overall band
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg leading-snug font-bold text-navy">
            {taskTitle}
          </h2>
          <p className="mt-1 text-[0.8125rem] text-muted">
            {feedback.evaluated_label}
            {feedback.confidence_label ? (
              <span className="text-muted-light">
                {" "}
                · {feedback.confidence_label}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-cyan/25 bg-cyan-soft/40 px-3.5 py-2.5">
        <p className="text-[12.5px] font-medium text-[#0D1F3C]">
          {feedback.criterion_gap_label}
        </p>
      </div>
    </section>
  );
}
