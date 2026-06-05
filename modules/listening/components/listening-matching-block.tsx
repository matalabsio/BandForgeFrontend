"use client";

import { memo, useMemo } from "react";
import type { ListeningOption, ListeningQuestion } from "@/modules/listening/types";
import { ExamMatchingDnDBlock } from "@/components/exam/exam-matching-dnd-block";
import { blockQuestionRange } from "@/modules/listening/lib/listening-question-groups";
import { normalizeLetter, sortMatchingOptions } from "@/modules/listening/lib/listening-matching";

type Props = {
  questions: ListeningQuestion[];
  instruction: string | null;
  options: ListeningOption[];
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onAnswer: (questionId: string, value: string) => void;
  onFocus: (questionId: string) => void;
};

function ListeningMatchingBlockBase({
  questions,
  instruction,
  options,
  answers,
  currentQuestionId,
  onAnswer,
  onFocus,
}: Props) {
  const sortedQuestions = useMemo(
    () =>
      questions.toSorted(
        (a, b) =>
          (a.display_number ?? a.question_number) -
          (b.display_number ?? b.question_number),
      ),
    [questions],
  );

  const sortedOptions = useMemo(
    () => sortMatchingOptions(options),
    [options],
  );

  return (
    <article className="rounded-lg border border-[var(--exam-border)] bg-white p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--exam-accent)]">
        {blockQuestionRange(questions)}: Matching
      </p>
      {instruction ? (
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--exam-ink-muted)]">
          {instruction}
        </p>
      ) : null}

      <div className="mt-5">
        <ExamMatchingDnDBlock
          questions={sortedQuestions}
          options={sortedOptions}
          answers={answers}
          onAnswer={onAnswer}
          onFocus={onFocus}
          currentQuestionId={currentQuestionId}
          labelFormat="letter"
          variant="exam"
          normalize={normalizeLetter}
          poolTitle="Options"
          slotPlaceholder="Drop letter here"
          pendingHint="Tap an option, then tap an empty row to assign."
        />
      </div>
    </article>
  );
}

export const ListeningMatchingBlock = memo(ListeningMatchingBlockBase);
