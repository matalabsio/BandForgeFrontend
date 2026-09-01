"use client";

import { useEffect, useRef } from "react";
import {
  bfExamQBrowseAnsweredClass,
  bfExamQBrowseCurrentClass,
  bfExamQBrowseIdleClass,
} from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

export type ExamAnswerSheetItem = {
  id: string;
  number: number;
};

/** `exam` = listening/mock (--exam-*); `reading` = reading passages. */
export type ExamAnswerSheetPalette = "exam" | "reading" | "diagnostic";

const NAV_STRIP_CLASS =
  "mt-2.5 flex flex-nowrap gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const CHIP_BASE =
  "inline-flex h-8 w-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border text-[12px] font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-1";

function chipClass(
  palette: ExamAnswerSheetPalette,
  answered: boolean,
  isCurrent: boolean,
): string {
  if (palette === "diagnostic") {
    if (isCurrent) {
      return cn(
        CHIP_BASE,
        "border-transparent bg-cyan text-white",
      );
    }
    if (answered) {
      return cn(
        CHIP_BASE,
        "border-cyan/50 bg-cyan/10 text-cyan",
      );
    }
    return cn(
      CHIP_BASE,
      "border-navy/14 bg-white text-[#5A6B82] hover:border-navy/30",
    );
  }

  if (palette === "reading") {
    return cn(
      CHIP_BASE,
      isCurrent
        ? "border-transparent bg-[var(--reading-accent)] text-white"
        : answered
          ? "border-[var(--reading-accent)]/50 bg-[var(--reading-accent-soft)] text-[var(--reading-accent)]"
          : "border-[var(--reading-border)] bg-white text-[var(--reading-ink-muted)] hover:border-[var(--reading-ink)]/30",
    );
  }

  return cn(
    isCurrent
      ? bfExamQBrowseCurrentClass
      : answered
        ? bfExamQBrowseAnsweredClass
        : bfExamQBrowseIdleClass,
  );
}

type Props = {
  questions: ExamAnswerSheetItem[];
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onSelect: (id: string) => void;
  palette?: ExamAnswerSheetPalette;
  className?: string;
};

export function ExamAnswerSheetNav({
  questions,
  answers,
  currentQuestionId,
  onSelect,
  palette = "exam",
  className,
}: Props) {
  const currentRef = useRef<HTMLButtonElement>(null);
  const diagnostic = palette === "diagnostic";
  const reading = palette === "reading";

  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentQuestionId]);

  if (questions.length === 0) return null;

  const rangeEnd = questions[questions.length - 1]?.number ?? questions.length;

  return (
    <div
      className={cn(
        "shrink-0 border-b bg-white px-3 py-3 sm:px-4",
        diagnostic
          ? "border-navy/10"
          : reading
            ? "border-[var(--reading-border)]"
            : "border-[var(--exam-border)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-[10px] font-bold tracking-[0.16em] uppercase",
            diagnostic
              ? "text-cyan"
              : reading
                ? "text-[var(--reading-accent)]"
                : "text-[var(--exam-accent)]",
          )}
        >
          Answer sheet
        </p>
        <p
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums",
            diagnostic
              ? "bg-navy/[0.04] text-navy"
              : reading
                ? "bg-[var(--reading-ink)]/[0.04] text-[var(--reading-ink)]"
                : "bg-[var(--exam-paper)] text-[var(--exam-ink)]",
          )}
        >
          1-{rangeEnd}
        </p>
      </div>
      <div
        className={NAV_STRIP_CLASS}
        role="tablist"
        aria-label="Question navigation"
      >
        {questions.map((q) => {
          const answered = Boolean((answers[q.id] ?? "").trim());
          const isCurrent = currentQuestionId === q.id;
          return (
            <button
              key={q.id}
              ref={isCurrent ? currentRef : undefined}
              type="button"
              role="tab"
              onClick={() => onSelect(q.id)}
              className={chipClass(palette, answered, isCurrent)}
              aria-label={`Question ${q.number}${answered ? ", answered" : ""}`}
              aria-selected={isCurrent}
            >
              {q.number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
