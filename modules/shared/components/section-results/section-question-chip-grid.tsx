"use client";

import type { SectionQuestionStatus, SectionReviewQuestion } from "./section-results-types";

const CHIP_STYLES: Record<SectionQuestionStatus, string> = {
  correct: "bg-emerald-500 text-white",
  incorrect: "bg-red-500 text-white",
  skipped:
    "border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-[#94A3B8]",
};

type Props = {
  questions: SectionReviewQuestion[];
  columns?: 5 | 8;
  onQuestionClick?: (questionNumber: number) => void;
};

export function SectionQuestionChipGrid({
  questions,
  columns = 5,
  onQuestionClick,
}: Props) {
  const gridClass = columns === 8 ? "grid-cols-4 sm:grid-cols-8" : "grid-cols-5";

  return (
    <div className={`grid ${gridClass} gap-2 sm:gap-2.5`}>
      {questions.map((q) => {
        const clickable = Boolean(onQuestionClick);
        const className = `flex aspect-square items-center justify-center rounded-[11px] font-mono text-sm font-medium transition-opacity sm:text-[14px] ${CHIP_STYLES[q.status]} ${
          clickable ? "cursor-pointer hover:opacity-90" : ""
        }`;

        if (clickable) {
          return (
            <button
              key={q.question_id}
              type="button"
              onClick={() => onQuestionClick?.(q.question_number)}
              className={className}
              aria-label={`Question ${q.question_number}, ${q.status}`}
            >
              {q.question_number}
            </button>
          );
        }

        return (
          <div key={q.question_id} className={className} aria-hidden>
            {q.question_number}
          </div>
        );
      })}
    </div>
  );
}

export function SectionResultsLegend() {
  const items: { status: SectionQuestionStatus; label: string }[] = [
    { status: "correct", label: "Correct" },
    { status: "incorrect", label: "Incorrect" },
    { status: "skipped", label: "Skipped" },
  ];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-muted">
        {items.map(({ status, label }) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span
              className={`size-2.5 rounded-full ${
                status === "correct"
                  ? "bg-emerald-500"
                  : status === "incorrect"
                    ? "bg-red-500"
                    : "border border-dashed border-[#CBD5E1] bg-[#F8FAFC]"
              }`}
              aria-hidden
            />
            {label}
          </span>
        ))}
      </div>
      <span className="text-[12.5px] text-[#94A3B8] sm:text-right">
        Tap a row to see the explanation · tap a chip on Summary to jump here.
      </span>
    </div>
  );
}
