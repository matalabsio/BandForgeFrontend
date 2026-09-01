"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** One-row question strip — swipe horizontally on narrow viewports. */
const QUESTION_STRIP_CLASS =
  "flex gap-2 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export type ReadingAnswerSheetItem = {
  id: string;
  number: number;
};

type Props = {
  questions: ReadingAnswerSheetItem[];
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onJump: (id: string) => void;
  /** Use BandForge navy/cyan tokens instead of --reading-* CSS vars. */
  tone?: "exam" | "diagnostic";
};

export function ReadingAnswerSheet({
  questions,
  answers,
  currentQuestionId,
  onJump,
  tone = "exam",
}: Props) {
  const diagnostic = tone === "diagnostic";
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentQuestionId]);

  return (
    <div
      className={cn(
        "shrink-0 border-b bg-white px-3 py-3 sm:px-4",
        diagnostic
          ? "border-navy/10"
          : "border-[var(--reading-border)]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-[10px] font-bold tracking-[0.16em] uppercase",
            diagnostic
              ? "text-cyan"
              : "text-[var(--reading-accent)]",
          )}
        >
          Answer sheet
        </p>
        <p
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums",
            diagnostic
              ? "bg-navy/[0.04] text-navy"
              : "bg-[var(--reading-ink)]/[0.04] text-[var(--reading-ink)]",
          )}
        >
          1-{questions.length}
        </p>
      </div>
      <div
        className={cn("mt-2.5", QUESTION_STRIP_CLASS)}
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
              onClick={() => onJump(q.id)}
              className={cn(
                "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border text-[12px] font-bold tabular-nums transition-colors sm:size-10",
                diagnostic
                  ? isCurrent
                    ? "border-transparent bg-cyan text-white"
                    : answered
                      ? "border-cyan/50 bg-cyan/10 text-cyan"
                      : "border-navy/14 bg-white text-[#5A6B82] hover:border-navy/30"
                  : isCurrent
                    ? "border-transparent bg-[var(--reading-accent)] text-white"
                    : answered
                      ? "border-[var(--reading-accent)]/50 bg-[var(--reading-accent-soft)] text-[var(--reading-accent)]"
                      : "border-[var(--reading-border)] bg-white text-[var(--reading-ink-muted)] hover:border-[var(--reading-ink)]/30",
              )}
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
