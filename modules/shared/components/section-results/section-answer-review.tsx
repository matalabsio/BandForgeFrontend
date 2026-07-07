"use client";

import { useEffect, useMemo, useState } from "react";
import type { SectionReviewQuestion } from "./section-results-types";
import { SectionAnswerRow } from "./section-answer-row";

type Filter = "all" | "incorrect";

type Props = {
  questions: SectionReviewQuestion[];
  highlightQuestion?: number | null;
  onHighlightConsumed?: () => void;
};

export function SectionAnswerReview({
  questions,
  highlightQuestion = null,
  onHighlightConsumed,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const incorrectCount = useMemo(
    () => questions.filter((q) => q.status === "incorrect").length,
    [questions],
  );

  const visible = useMemo(() => {
    if (filter === "incorrect") {
      return questions.filter((q) => q.status === "incorrect" || q.status === "skipped");
    }
    return questions;
  }, [filter, questions]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 gap-2">
        <FilterPill
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`All (${questions.length})`}
        />
        <FilterPill
          active={filter === "incorrect"}
          onClick={() => setFilter("incorrect")}
          label={`Incorrect only (${incorrectCount})`}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain sm:gap-2.5">
        {visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted">
            No questions match this filter.
          </p>
        ) : (
          visible.map((q) => (
            <SectionAnswerRow
              key={q.question_id}
              question={q}
              highlight={highlightQuestion === q.question_number}
            />
          ))
        )}
      </div>

      {highlightQuestion != null ? (
        <HighlightScroller
          questionNumber={highlightQuestion}
          onDone={onHighlightConsumed}
        />
      ) : null}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 cursor-pointer items-center justify-center rounded-[10px] border px-2 py-2.5 text-[13px] font-medium transition-colors sm:text-[13.5px] ${
        active
          ? "border-cyan/30 bg-cyan/15 font-semibold text-navy"
          : "border-[rgb(13_31_60/0.14)] text-[#6E83A0] hover:bg-surface"
      }`}
    >
      {label}
    </button>
  );
}

function HighlightScroller({
  questionNumber,
  onDone,
}: {
  questionNumber: number;
  onDone?: () => void;
}) {
  useEffect(() => {
    const id = `section-q-${questionNumber}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    onDone?.();
  }, [questionNumber, onDone]);

  return null;
}
