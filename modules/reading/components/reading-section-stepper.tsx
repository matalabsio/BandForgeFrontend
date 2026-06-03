"use client";

import {
  QUESTION_SECTION_ORDER,
  prevSection,
  type QuestionSectionId,
} from "@/modules/reading/lib/reading-exam-flow";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<QuestionSectionId, string> = {
  tfng: "1–5 · TFNG",
  matching_headings: "6–9 · Headings",
  sentence_completion: "10–13 · Completion",
};

type Props = {
  current: QuestionSectionId;
  onSelect: (section: QuestionSectionId) => void;
  labels?: Partial<Record<QuestionSectionId, string>>;
  onBack: () => void;
  onContinue: () => void;
  onSubmit: () => void;
  busy?: boolean;
  isLastSection: boolean;
  continueLabel?: string;
};

export function ReadingSectionStepper({
  current,
  onSelect,
  labels,
  onBack,
  onContinue,
  onSubmit,
  busy = false,
  isLastSection,
  continueLabel,
}: Props) {
  const currentIdx = QUESTION_SECTION_ORDER.indexOf(current);
  const hasPrev = prevSection(current) !== null;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[var(--reading-border)] bg-white px-4 py-3"
      aria-label="Question sections"
    >
      <div className="flex min-w-0 flex-wrap gap-2">
        {QUESTION_SECTION_ORDER.map((id, idx) => {
          const isCurrent = id === current;
          const isPast = idx < currentIdx;
          const canNavigate = isPast || isCurrent;
          return (
            <button
              key={id}
              type="button"
              disabled={!canNavigate}
              onClick={() => canNavigate && onSelect(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors",
                isCurrent
                  ? "bg-[var(--reading-accent)] text-white"
                  : isPast
                    ? "cursor-pointer bg-[var(--reading-accent-soft)] text-[var(--reading-accent)] hover:bg-[var(--reading-accent)]/20"
                    : "cursor-not-allowed bg-[var(--reading-surface)] text-[var(--reading-ink-muted)]/50",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {labels?.[id] ?? STEP_LABELS[id]}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={onBack}
          className="cursor-pointer rounded-md border border-[var(--reading-border)] bg-white px-3 py-1.5 text-[11px] font-bold text-[var(--reading-ink)] transition-colors hover:border-[var(--reading-accent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous section
        </button>
        {isLastSection ? (
          <button
            type="button"
            disabled={busy}
            onClick={onSubmit}
            className="cursor-pointer rounded-md bg-[var(--reading-accent)] px-4 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Submitting…" : (continueLabel ?? "Submit passage")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            className="cursor-pointer rounded-md bg-[var(--reading-accent)] px-4 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#0891B2]"
          >
            {continueLabel ?? "Continue"}
          </button>
        )}
      </div>
    </nav>
  );
}
