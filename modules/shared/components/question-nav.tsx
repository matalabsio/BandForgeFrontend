"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type QuestionNavProps = {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: ReadonlySet<number> | readonly number[];
  onSelect: (questionNumber: number) => void;
  /** e.g. "Questions" for screen readers */
  label?: string;
};

function isAnswered(
  questionNumber: number,
  answered: ReadonlySet<number> | readonly number[],
): boolean {
  if (answered instanceof Set) {
    return answered.has(questionNumber);
  }
  return (answered as readonly number[]).includes(questionNumber);
}

function NavGrid({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onSelect,
}: QuestionNavProps) {
  return (
    <ol className="grid grid-cols-5 gap-2 sm:grid-cols-8">
      {Array.from({ length: totalQuestions }, (_, i) => {
        const num = i + 1;
        const answered = isAnswered(num, answeredQuestions);
        return (
          <li key={num}>
            <button
              type="button"
              onClick={() => onSelect(num)}
              aria-current={num === currentQuestion ? "step" : undefined}
              aria-label={`Question ${num}${answered ? ", answered" : ", unanswered"}`}
              className={cn(
                "question-nav-btn cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2",
                answered
                  ? "question-nav-btn--answered"
                  : "question-nav-btn--unanswered",
                num === currentQuestion && "question-nav-btn--current",
              )}
            >
              {num}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Question number panel — always visible on desktop; floating toggle on mobile (4.3).
 */
export function QuestionNav(props: QuestionNavProps) {
  const { label = "Question navigation" } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: persistent sidebar */}
      <aside
        className="hidden w-56 shrink-0 overflow-y-auto border-r border-surface bg-white p-4 lg:block"
        aria-label={label}
      >
        <NavGrid {...props} />
      </aside>

      {/* Mobile: floating opener */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="touch-target fixed bottom-4 right-4 z-40 flex cursor-pointer items-center justify-center rounded-full bg-navy text-sm font-semibold text-white shadow-lg transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
        >
          Q{props.currentQuestion}
        </button>

        {mobileOpen ? (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-white"
            role="dialog"
            aria-modal="true"
            aria-label={label}
          >
            <div className="flex items-center justify-between border-b border-surface px-4 py-3">
              <span className="text-body font-semibold text-navy">{label}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="touch-target rounded-md px-3 text-body font-medium text-teal"
              >
                Done
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavGrid
                {...props}
                onSelect={(n) => {
                  props.onSelect(n);
                  setMobileOpen(false);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
