"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import type { ListeningPart, ListeningQuestion } from "@/modules/listening/types";
import { ListeningQuestionPanel } from "@/modules/listening/components/listening-question-panel";
import { formSectionForQuestion } from "@/modules/listening/lib/form-sections";
import { isFormCompletionPart } from "@/modules/listening/lib/form-completion";
import { cn } from "@/lib/utils";

type Props = {
  part: ListeningPart;
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onAnswer: (questionId: string, value: string) => void;
  onFocus: (questionId: string) => void;
  instruction?: string | null;
};

function qDisplay(q: ListeningQuestion): number {
  return q.display_number ?? q.question_number;
}

function sortedQuestions(questions: ListeningQuestion[]) {
  return questions.toSorted((a, b) => qDisplay(a) - qDisplay(b));
}

function ListeningQuestionsPanelBase({
  part,
  answers,
  currentQuestionId,
  onAnswer,
  onFocus,
  instruction,
}: Props) {
  const sorted = useMemo(() => sortedQuestions(part.questions), [part.questions]);
  const formMode = isFormCompletionPart(part);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentIndex = Math.max(
    0,
    sorted.findIndex((q) => q.id === currentQuestionId),
  );
  const current = sorted[currentIndex] ?? sorted[0] ?? null;
  const activeNum = current ? qDisplay(current) : 1;
  const total = sorted.length;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < total - 1;

  const section = formMode && current ? formSectionForQuestion(current.question_number) : null;

  const goTo = (q: ListeningQuestion) => onFocus(q.id);
  const goPrev = () => {
    if (canPrev) goTo(sorted[currentIndex - 1]);
  };
  const goNext = () => {
    if (canNext) goTo(sorted[currentIndex + 1]);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "ArrowLeft" && canPrev) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" && canNext) {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canPrev, canNext, currentIndex, sorted]);

  useEffect(() => {
    if (current) {
      inputRef.current?.focus();
    }
  }, [current?.id]);

  if (!current) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-[13px] text-[var(--exam-ink-muted)]">
        No questions loaded.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--exam-surface)] lg:max-h-[calc(100dvh-3rem)]">
      <div className="shrink-0 border-b border-[var(--exam-border)] bg-white px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--exam-accent)]">
            Answer sheet
          </p>
          <p className="rounded-full bg-[var(--exam-paper)] px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-[var(--exam-ink)]">
            {activeNum} / {total}
          </p>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1" role="tablist" aria-label="Question navigation">
          {sorted.map((q) => {
            const answered = Boolean((answers[q.id] ?? "").trim());
            const active = q.id === current.id;
            return (
              <button
                key={q.id}
                type="button"
                role="tab"
                onClick={() => goTo(q)}
                className={cn(
                  "flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border text-[12px] font-bold transition-colors duration-150",
                  active
                    ? "border-[var(--exam-bar)] bg-[var(--exam-bar)] text-white shadow-sm"
                    : answered
                      ? "border-[var(--exam-accent)]/50 bg-[var(--exam-accent-soft)] text-[var(--exam-accent)]"
                      : "border-[var(--exam-border)] bg-white text-[var(--exam-ink-muted)] hover:border-[var(--exam-ink-muted)]",
                )}
                aria-label={`Question ${qDisplay(q)}${answered ? ", answered" : ""}`}
                aria-selected={active}
              >
                {qDisplay(q)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-5">
        {formMode ? (
          <>
            {section?.showFormHeader ? (
              <div className="mb-4 shrink-0 overflow-hidden rounded-lg border border-[var(--exam-border)] bg-white text-center shadow-sm">
                <div className="border-b border-[var(--exam-border)] bg-[var(--exam-paper)] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--exam-ink-muted)]">
                    Greenfield College
                  </p>
                  <p className="mt-1 font-display text-[15px] font-bold text-[var(--exam-ink)]">
                    Course Registration Form
                  </p>
                </div>
                {instruction ? (
                  <p className="px-4 py-3 text-left text-[12px] leading-relaxed text-[var(--exam-ink-muted)]">
                    {instruction}
                  </p>
                ) : null}
              </div>
            ) : null}

            {section ? (
              <p className="mb-3 shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--exam-ink-muted)]">
                {section.sectionTitle}
              </p>
            ) : null}
          </>
        ) : instruction ? (
          <div className="mb-4 shrink-0 rounded-lg border border-[var(--exam-border)] bg-white px-4 py-3">
            <p className="text-[12px] leading-relaxed text-[var(--exam-ink-muted)] whitespace-pre-wrap">
              {instruction}
            </p>
          </div>
        ) : null}

        <article
          key={current.id}
          className="flex min-h-0 flex-1 flex-col rounded-lg border-2 border-[var(--exam-accent)] bg-white p-5 shadow-md"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md bg-[var(--exam-bar)] text-[13px] font-bold text-white">
              {qDisplay(current)}
            </span>
            <div className="min-w-0 flex-1">
              {formMode ? (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--exam-ink-muted)]">
                    {current.prompt}
                  </p>
                  <label className="mt-3 block">
                    <span className="sr-only">Answer for question {qDisplay(current)}</span>
                    <span className="flex items-baseline gap-1 border-b-2 border-[var(--exam-ink)] pb-1">
                      {current.question_number === 8 ? (
                        <span className="shrink-0 text-[15px] text-[var(--exam-ink-muted)]">
                          £
                        </span>
                      ) : null}
                      <input
                        ref={inputRef}
                        type="text"
                        value={answers[current.id] ?? ""}
                        onChange={(e) => onAnswer(current.id, e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        className="min-w-0 flex-1 border-0 bg-transparent font-display text-[18px] font-medium text-[var(--exam-ink)] outline-none placeholder:text-[var(--exam-border)]"
                        placeholder="Type your answer"
                        aria-label={`Question ${qDisplay(current)}: ${current.prompt}`}
                      />
                    </span>
                  </label>
                  <p className="mt-3 text-[11px] text-[var(--exam-ink-muted)]">
                    NO MORE THAN TWO WORDS AND/OR A NUMBER
                  </p>
                </>
              ) : (
                <ListeningQuestionPanel
                  question={current}
                  value={answers[current.id] ?? ""}
                  onChange={(v) => onAnswer(current.id, v)}
                  variant="exam"
                  hideMeta
                />
              )}
            </div>
          </div>
        </article>

        <div className="mt-5 flex shrink-0 items-center justify-between gap-3">
          <button
            type="button"
            disabled={!canPrev}
            onClick={goPrev}
            className="cursor-pointer rounded-md border border-[var(--exam-border)] bg-white px-4 py-2.5 text-[12px] font-bold text-[var(--exam-ink)] transition-colors hover:border-[var(--exam-accent)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={goNext}
            className="cursor-pointer rounded-md bg-[var(--exam-accent)] px-4 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export const ListeningQuestionsPanel = memo(ListeningQuestionsPanelBase);
