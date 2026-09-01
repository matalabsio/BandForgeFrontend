"use client";

import { memo, useMemo } from "react";
import { FormCompletionPart } from "@/modules/listening/components/form-completion-part";
import { ListeningChooseTwoBlock } from "@/modules/listening/components/listening-choose-two-block";
import { ListeningMatchingBlock } from "@/modules/listening/components/listening-matching-block";
import { ListeningPartFooter } from "@/modules/listening/components/listening-part-footer";
import { ListeningQuestionPanel } from "@/modules/listening/components/listening-question-panel";
import { ListeningNoteCompletionBlock } from "@/modules/listening/components/listening-note-completion-block";
import { ListeningSentenceCompletionBlock } from "@/modules/listening/components/listening-sentence-completion-block";
import { groupListeningQuestions } from "@/modules/listening/lib/listening-question-groups";
import type { ListeningPartAudioPhase } from "@/modules/listening/lib/listening-part-intro";
import type { ListeningPart, ListeningQuestion } from "@/modules/listening/types";
import { ExamAnswerSheetNav } from "@/modules/shared/components/exam-answer-sheet-nav";
import { cn } from "@/lib/utils";

type Props = {
  part: ListeningPart;
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onAnswer: (questionId: string, value: string) => void;
  onFocus: (questionId: string) => void;
  partPlayed?: boolean;
  visible?: boolean;
  phase?: ListeningPartAudioPhase;
  nextPartLabel?: string;
  submitBusy?: boolean;
  onSubmitPart?: () => void;
  /** @deprecated Use variant="diagnostic" without embedded */
  embedded?: boolean;
  variant?: "exam" | "diagnostic";
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
  visible = true,
  phase,
  nextPartLabel,
  submitBusy = false,
  onSubmitPart,
  embedded = false,
  variant = "exam",
}: Props) {
  const sorted = useMemo(() => sortedQuestions(part.questions), [part.questions]);
  const blocks = useMemo(() => groupListeningQuestions(part), [part]);

  if (sorted.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-[13px] text-[var(--exam-ink-muted)]">
        No questions loaded.
      </div>
    );
  }

  const isDiagnostic = variant === "diagnostic";
  const showNav = visible;
  const inPreview = phase === "preview";

  return (
    <div
      className={cn(
        "flex flex-col",
        isDiagnostic
          ? "shrink-0 bg-transparent"
          : embedded
            ? "min-h-0 flex-1 bg-[var(--exam-surface)]"
            : "h-full bg-[var(--exam-surface)] lg:max-h-[calc(100dvh-3rem)]",
      )}
    >
      {showNav ? (
        <ExamAnswerSheetNav
          questions={sorted.map((q) => ({
            id: q.id,
            number: qDisplay(q),
          }))}
          answers={answers}
          currentQuestionId={currentQuestionId}
          onSelect={onFocus}
          palette={isDiagnostic ? "diagnostic" : "exam"}
        />
      ) : null}

      <div
        className={cn(
          isDiagnostic ? "block" : "flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-5",
          visible && nextPartLabel && onSubmitPart && !isDiagnostic && "pb-4",
        )}
      >
        {!visible ? (
          <div className="flex min-h-full flex-1 items-center justify-center">
            <div
              className={cn(
                "max-w-sm rounded-lg border bg-white p-5 text-center shadow-sm",
                isDiagnostic ? "border-navy/10" : "border-[var(--exam-border)]",
              )}
            >
              <p
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.14em]",
                  isDiagnostic ? "text-cyan" : "text-[var(--exam-accent)]",
                )}
              >
                Waiting to begin
              </p>
              <p
                className={cn(
                  "mt-2 text-[13px] leading-relaxed",
                  isDiagnostic ? "text-[#5A6B82]" : "text-[var(--exam-ink-muted)]",
                )}
              >
                Questions appear when you begin this section.
              </p>
            </div>
          </div>
        ) : null}

        {visible ? (
          <div className="space-y-4">
            {inPreview ? (
              <p
                className={cn(
                  "rounded-lg border px-3 py-2 text-[12px] leading-relaxed",
                  isDiagnostic
                    ? "border-cyan/30 bg-cyan/5 text-[#5A6B82]"
                    : "border-[var(--exam-accent)]/30 bg-[var(--exam-accent-soft)] text-[var(--exam-ink-muted)]",
                )}
              >
                Read the questions before the recording starts.
              </p>
            ) : null}
            {blocks.map((block) => {
              if (block.kind === "form") {
                return (
                  <FormCompletionPart
                    key="form"
                    part={part}
                    answers={answers}
                    partPlayed={partPlayed}
                    currentQuestionId={currentQuestionId}
                    onAnswer={onAnswer}
                    onFocus={onFocus}
                    onPartPlayed={() => {}}
                    variant={isDiagnostic ? "diagnostic" : "exam"}
                    deferAudio
                  />
                );
              }
              if (block.kind === "choose_two") {
                return (
                  <ListeningChooseTwoBlock
                    key={`choose-two-${block.questions[0].id}`}
                    questions={block.questions}
                    instruction={block.instruction}
                    stem={block.stem}
                    options={block.options}
                    answers={answers}
                    currentQuestionId={currentQuestionId}
                    onAnswer={onAnswer}
                    onFocus={onFocus}
                    variant={isDiagnostic ? "diagnostic" : "exam"}
                  />
                );
              }
              if (block.kind === "matching") {
                return (
                  <ListeningMatchingBlock
                    key={`matching-${block.questions[0].id}`}
                    questions={block.questions}
                    instruction={block.instruction}
                    options={block.options}
                    answers={answers}
                    currentQuestionId={currentQuestionId}
                    onAnswer={onAnswer}
                    onFocus={onFocus}
                  />
                );
              }
              if (block.kind === "note_completion") {
                return (
                  <ListeningNoteCompletionBlock
                    key={`notes-${block.questions[0].id}`}
                    questions={block.questions}
                    instruction={block.instruction}
                    notesTitle={part.notes_title}
                    notesSections={part.notes_sections}
                    answers={answers}
                    currentQuestionId={currentQuestionId}
                    onAnswer={onAnswer}
                    onFocus={onFocus}
                  />
                );
              }
              if (block.kind === "sentence_completion") {
                return (
                  <ListeningSentenceCompletionBlock
                    key={`sentence-${block.questions[0].id}`}
                    questions={block.questions}
                    instruction={block.instruction}
                    answers={answers}
                    currentQuestionId={currentQuestionId}
                    onAnswer={onAnswer}
                    onFocus={onFocus}
                  />
                );
              }
              return (
                <div
                  key={block.question.id}
                  className={cn(
                    isDiagnostic
                      ? "rounded-[13px] border border-navy/14 bg-white p-4 sm:p-5"
                      : "rounded-lg border border-[var(--exam-border)] bg-white p-4",
                    !isDiagnostic &&
                      currentQuestionId === block.question.id &&
                      "ring-1 ring-[var(--exam-accent)]/30",
                  )}
                >
                  <ListeningQuestionPanel
                    question={block.question}
                    value={answers[block.question.id] ?? ""}
                    onChange={(v) => onAnswer(block.question.id, v)}
                    onFocus={() => onFocus(block.question.id)}
                    isActive={currentQuestionId === block.question.id}
                    variant={isDiagnostic ? "diagnostic" : "exam"}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {visible && nextPartLabel && onSubmitPart ? (
        <ListeningPartFooter
          label={nextPartLabel}
          busy={submitBusy}
          onSubmit={onSubmitPart}
        />
      ) : null}
    </div>
  );
}

export const ListeningQuestionsPanel = memo(ListeningQuestionsPanelBase);
