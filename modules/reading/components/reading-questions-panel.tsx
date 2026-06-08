"use client";

import { useEffect, useMemo } from "react";
import type { ReadingQuestion } from "@/modules/reading/types";
import {
  groupReadingQuestions,
  type QuestionGroup,
} from "@/modules/reading/lib/question-groups";
import { ReadingQuestionInput } from "@/modules/reading/components/reading-question-input";
import { cn } from "@/lib/utils";

type Props = {
  passage: number;
  mockSlug?: string;
  questions: ReadingQuestion[];
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
  activeQuestion: number;
  onActiveQuestion: (n: number) => void;
};

function qDisplay(q: ReadingQuestion): number {
  return q.display_number ?? q.question_number;
}

function findGroupForQuestion(
  groups: QuestionGroup[],
  questionNumber: number,
): QuestionGroup | undefined {
  return groups.find((g) =>
    g.questions.some((q) => qDisplay(q) === questionNumber),
  );
}

export function ReadingQuestionsPanel({
  passage,
  mockSlug,
  questions,
  answers,
  onAnswer,
  activeQuestion,
  onActiveQuestion,
}: Props) {
  const groups = useMemo(
    () => groupReadingQuestions(questions, passage, mockSlug),
    [questions, passage, mockSlug],
  );

  const sorted = useMemo(
    () => questions.toSorted((a, b) => qDisplay(a) - qDisplay(b)),
    [questions],
  );

  const currentIndex = sorted.findIndex((q) => qDisplay(q) === activeQuestion);
  const current =
    currentIndex >= 0 ? sorted[currentIndex] : sorted[0] ?? null;

  const activeNum = current ? qDisplay(current) : 1;
  const group = findGroupForQuestion(groups, activeNum);
  const isFirstInGroup =
    group?.questions[0] != null && qDisplay(group.questions[0]) === activeNum;
  const total = sorted.length;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < total - 1;

  const goTo = (num: number) => onActiveQuestion(num);

  const goPrev = () => {
    if (canPrev) goTo(qDisplay(sorted[currentIndex - 1]));
  };

  const goNext = () => {
    if (canNext) goTo(qDisplay(sorted[currentIndex + 1]));
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const idx = sorted.findIndex((q) => qDisplay(q) === activeQuestion);
      if (e.key === "ArrowLeft" && idx > 0) {
        e.preventDefault();
        goTo(qDisplay(sorted[idx - 1]));
      } else if (e.key === "ArrowRight" && idx >= 0 && idx < sorted.length - 1) {
        e.preventDefault();
        goTo(qDisplay(sorted[idx + 1]));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sorted, activeQuestion, onActiveQuestion]);

  if (!current) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-[13px] text-[var(--reading-ink-muted)]">
        No questions loaded.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--reading-surface)]">
      <div className="shrink-0 border-b border-[var(--reading-border)] bg-white px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--reading-ink-muted)]">
            Questions
          </p>
          <p className="text-[11px] font-semibold tabular-nums text-[var(--reading-ink-muted)]">
            {activeNum} of {total}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {sorted.map((q) => {
            const answered = Boolean((answers[q.id] ?? "").trim());
            const active = qDisplay(q) === activeNum;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goTo(qDisplay(q))}
                className={cn(
                  "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md border text-[12px] font-bold transition-colors",
                  active
                    ? "border-[var(--reading-accent)] bg-[var(--reading-accent)] text-white"
                    : answered
                      ? "border-[var(--reading-accent)]/40 bg-[var(--reading-accent-soft)] text-[var(--reading-accent)]"
                      : "border-[var(--reading-border)] bg-white text-[var(--reading-ink-muted)] hover:border-[var(--reading-muted)]",
                )}
                aria-label={`Question ${qDisplay(q)}${answered ? ", answered" : ""}`}
                aria-current={active ? "true" : undefined}
              >
                {qDisplay(q)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
        {group && isFirstInGroup ? (
          <div className="mb-4 shrink-0 rounded-lg border border-[var(--reading-border)] bg-white px-4 py-3">
            <h3 className="font-display text-[14px] font-bold text-[var(--reading-ink)]">
              {group.title}
            </h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--reading-ink-muted)]">
              {group.instruction}
            </p>
          </div>
        ) : group ? (
          <p className="mb-3 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[var(--reading-ink-muted)]">
            {group.title}
          </p>
        ) : null}

        <article
          key={current.id}
          className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--reading-accent)] bg-white p-5 shadow-sm ring-1 ring-[var(--reading-accent)]/15"
        >
          <p className="text-[14px] font-semibold leading-snug text-[var(--reading-ink)]">
            <span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[var(--reading-bar)] text-[12px] font-bold text-white">
              {qDisplay(current)}
            </span>
            {current.prompt}
          </p>
          <div className="mt-4 flex-1">
            <ReadingQuestionInput
              q={current}
              value={answers[current.id] ?? ""}
              onChange={(v) => onAnswer(current.id, v)}
            />
          </div>
        </article>

        <div className="mt-4 flex shrink-0 items-center justify-between gap-3">
          <button
            type="button"
            disabled={!canPrev}
            onClick={goPrev}
            className="cursor-pointer rounded-md border border-[var(--reading-border)] bg-white px-4 py-2 text-[12px] font-bold text-[var(--reading-ink)] transition-colors hover:border-[var(--reading-accent)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={goNext}
            className="cursor-pointer rounded-md border border-[var(--reading-border)] bg-white px-4 py-2 text-[12px] font-bold text-[var(--reading-ink)] transition-colors hover:border-[var(--reading-accent)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
