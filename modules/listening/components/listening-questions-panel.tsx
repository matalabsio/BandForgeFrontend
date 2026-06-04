"use client";

import { memo, useMemo } from "react";
import { FormCompletionPart } from "@/modules/listening/components/form-completion-part";
import { ListeningQuestionPanel } from "@/modules/listening/components/listening-question-panel";
import { isFormCompletionPart } from "@/modules/listening/lib/form-completion";
import type { ListeningPart, ListeningQuestion } from "@/modules/listening/types";
import { cn } from "@/lib/utils";

type Props = {
  part: ListeningPart;
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onAnswer: (questionId: string, value: string) => void;
  onFocus: (questionId: string) => void;
  partPlayed?: boolean;
  instruction?: string | null;
  visible?: boolean;
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
  partPlayed = false,
  instruction,
  visible = true,
}: Props) {
  const sorted = useMemo(() => sortedQuestions(part.questions), [part.questions]);
  const isFormPart = useMemo(() => isFormCompletionPart(part), [part]);

  if (sorted.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-[13px] text-[var(--exam-ink-muted)]">
        No questions loaded.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--exam-surface)] lg:max-h-[calc(100dvh-3rem)]">
      {visible ? (
        <div className="shrink-0 border-b border-[var(--exam-border)] bg-white px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--exam-accent)]">
              Answer sheet
            </p>
            <p className="rounded-full bg-[var(--exam-paper)] px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-[var(--exam-ink)]">
              1-{sorted.length}
            </p>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1" role="tablist" aria-label="Question navigation">
            {sorted.map((q) => {
              const answered = Boolean((answers[q.id] ?? "").trim());
              const isCurrent = currentQuestionId === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  role="tab"
                  onClick={() => onFocus(q.id)}
                  className={cn(
                    "flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border text-[12px] font-bold transition-colors duration-150",
                    isCurrent
                      ? "border-[var(--exam-accent)] bg-[var(--exam-accent)] text-white"
                      : answered
                        ? "border-[var(--exam-accent)]/50 bg-[var(--exam-accent-soft)] text-[var(--exam-accent)]"
                        : "border-[var(--exam-border)] bg-white text-[var(--exam-ink-muted)] hover:border-[var(--exam-ink-muted)]",
                  )}
                  aria-label={`Question ${qDisplay(q)}${answered ? ", answered" : ""}`}
                  aria-selected={isCurrent}
                >
                  {qDisplay(q)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-5">
        {!visible ? (
          <div className="flex min-h-full flex-1 items-center justify-center">
            <div className="max-w-sm rounded-lg border border-[var(--exam-border)] bg-white p-5 text-center shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--exam-accent)]">
                Audio in progress
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--exam-ink-muted)]">
                Questions are shown after this part audio ends.
              </p>
            </div>
          </div>
        ) : null}

        {visible && instruction ? (
          <div className="mb-4 shrink-0 rounded-lg border border-[var(--exam-border)] bg-white px-4 py-3">
            <p className="text-[12px] leading-relaxed text-[var(--exam-ink-muted)] whitespace-pre-wrap">
              {instruction}
            </p>
          </div>
        ) : null}

        {visible && isFormPart ? (
          <FormCompletionPart
            part={part}
            answers={answers}
            partPlayed={partPlayed}
            currentQuestionId={currentQuestionId}
            onAnswer={onAnswer}
            onFocus={onFocus}
            onPartPlayed={() => {}}
            variant="exam"
            deferAudio
          />
        ) : null}

        {visible && !isFormPart ? (
          <ol className="space-y-3">
            {sorted.map((q) => (
              <li
                key={q.id}
                className={cn(
                  "rounded-lg border border-[var(--exam-border)] bg-white p-4",
                  currentQuestionId === q.id &&
                    "ring-1 ring-[var(--exam-accent)]/30",
                )}
              >
                <ListeningQuestionPanel
                  question={q}
                  value={answers[q.id] ?? ""}
                  onChange={(v) => onAnswer(q.id, v)}
                  onFocus={() => onFocus(q.id)}
                  isActive={currentQuestionId === q.id}
                  variant="exam"
                />
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
}

export const ListeningQuestionsPanel = memo(ListeningQuestionsPanelBase);
