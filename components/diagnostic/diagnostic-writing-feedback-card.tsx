import { CheckCircle2, Lightbulb } from "lucide-react";
import type { DiagnosticWritingEvaluation } from "@/lib/diagnostic-evaluate-writing";
import { cn } from "@/lib/utils";

type Props = {
  evaluation: DiagnosticWritingEvaluation;
  taskPart?: number;
  taskLabel?: string;
  essay?: string;
};

const CRITERIA: {
  key: keyof DiagnosticWritingEvaluation["scores"];
  label: string;
  shortLabel?: string;
}[] = [
  { key: "task_achievement", label: "Task Achievement" },
  { key: "coherence", label: "Coherence & Cohesion", shortLabel: "Coherence & Cohesion" },
  { key: "lexical_resource", label: "Lexical Resource" },
  { key: "grammar", label: "Grammar Range & Accuracy", shortLabel: "Grammar Range & Acc." },
];

function formatBand(score: number): string {
  return score.toFixed(1);
}

function FeedbackList({
  items,
  bulletClassName,
}: {
  items: string[];
  bulletClassName: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0 sm:gap-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2.5 font-sans text-[13.5px] leading-snug font-light text-[#334155] sm:text-sm sm:leading-relaxed"
        >
          <span className={cn("shrink-0 font-semibold", bulletClassName)}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CriterionCard({
  score,
  label,
  compact,
}: {
  score: number;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-[#EEF2F7] bg-white px-3.5 py-3.5 text-center sm:px-4 sm:py-4">
      <div className="font-mono text-[26px] leading-none font-medium text-cyan sm:text-[30px]">
        {formatBand(score)}
      </div>
      <div
        className={cn(
          "mt-2 font-sans font-medium text-[#0D1F3C] leading-snug",
          compact ? "text-xs" : "text-xs sm:text-[13px]",
        )}
      >
        {label}
      </div>
    </div>
  );
}

export function DiagnosticWritingFeedbackCard({
  evaluation,
  taskPart = 1,
  taskLabel = "Free Diagnostic",
  essay,
}: Props) {
  const { writing_band, scores, feedback, metadata } = evaluation;
  const improveItems = [...feedback.weaknesses, ...feedback.improvement_tips];
  const essayParagraphs = essay
    ? essay
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E3E9F1] bg-white shadow-[0_12px_40px_rgba(13,31,60,0.06)]">
      <div className="border-b border-[#EDF1F6] px-5 py-4 sm:px-6">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-navy sm:text-[19px]">
          Writing Feedback
        </h2>
      </div>

      <div className="space-y-6 px-5 py-6 sm:space-y-7 sm:px-6 sm:py-7">
        {/* Hero — mobile centered, desktop side-by-side */}
        <div className="text-center sm:flex sm:items-center sm:gap-8 sm:text-left">
          <div className="shrink-0 sm:text-center">
            <div className="font-mono text-[72px] leading-[0.9] font-medium text-cyan sm:text-[78px] sm:leading-[0.85]">
              {formatBand(writing_band)}
            </div>
            <div className="mt-1.5 font-mono text-[11px] tracking-[0.04em] text-[#94A3B8] uppercase sm:mt-1.5">
              Overall band
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:min-w-0 sm:flex-1 sm:border-l sm:border-[#EDF1F6] sm:pl-7">
            <div className="font-display text-[19px] font-bold tracking-tight text-navy sm:text-[23px]">
              Writing Task {taskPart} — {taskLabel}
            </div>
            <p className="mt-1.5 font-sans text-[13px] font-light text-[#64748B] sm:mt-1.5 sm:text-sm">
              AI evaluated · Band descriptors applied
            </p>
            {metadata.word_count > 0 ? (
              <p className="mt-1 font-mono text-[11px] tracking-wide text-[#94A3B8] uppercase">
                {metadata.word_count} words
              </p>
            ) : null}
          </div>
        </div>

        {evaluation.warnings && evaluation.warnings.length > 0 ? (
          <div
            className="rounded-[12px] border border-amber-200/80 bg-[#FEF8EC] px-4 py-3.5 text-[13px] leading-snug font-light text-[#5C4A2E]"
            role="status"
          >
            {evaluation.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}

        {/* Criterion grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {CRITERIA.map(({ key, label, shortLabel }) => (
            <CriterionCard
              key={key}
              score={scores[key]}
              label={shortLabel ?? label}
              compact={key === "grammar"}
            />
          ))}
        </div>

        {/* Strengths + To Improve */}
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5">
          {feedback.strengths.length > 0 ? (
            <div className="rounded-[14px] border border-[#D6F0E2] border-l-[3px] border-l-[#10B981] bg-[#F4FBF7] p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2
                  className="size-[17px] shrink-0 text-[#10B981] sm:size-[18px]"
                  strokeWidth={2.4}
                  aria-hidden
                />
                <h3 className="font-display text-base font-bold text-navy sm:text-[17px]">
                  Strengths
                </h3>
              </div>
              <FeedbackList items={feedback.strengths} bulletClassName="text-[#10B981]" />
            </div>
          ) : null}

          {improveItems.length > 0 ? (
            <div className="rounded-[14px] border border-[#F8E6BE] border-l-[3px] border-l-[#F59E0B] bg-[#FEF8EC] p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb
                  className="size-[17px] shrink-0 text-[#D98309] sm:size-[18px]"
                  strokeWidth={2.2}
                  aria-hidden
                />
                <h3 className="font-display text-base font-bold text-navy sm:text-[17px]">
                  To Improve
                </h3>
              </div>
              <FeedbackList items={improveItems} bulletClassName="text-[#D98309]" />
            </div>
          ) : null}
        </div>

        {/* Essay */}
        {essayParagraphs.length > 0 ? (
          <div>
            <div className="mb-3 font-mono text-[11px] tracking-[0.1em] text-[#94A3B8] uppercase sm:text-xs">
              Your essay
            </div>
            <div className="rounded-[14px] border border-[#EEF2F7] bg-[#F8FAFC] p-4 sm:p-[18px]">
              <div className="font-sans text-[13.5px] leading-[1.8] font-light text-[#334155] sm:text-sm sm:leading-[1.85]">
                {essayParagraphs.map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph.slice(0, 24)}`}
                    className={index < essayParagraphs.length - 1 ? "mb-3 sm:mb-3.5" : "m-0"}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
