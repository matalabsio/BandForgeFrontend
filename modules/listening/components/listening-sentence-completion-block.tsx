"use client";

import { memo } from "react";
import { SentenceInlineBlank } from "@/modules/listening/components/listening-inline-answer";
import {
  INLINE_BLANK_PATTERN,
  splitPromptBlank,
} from "@/modules/listening/lib/inline-blank";
import { blockQuestionRange } from "@/modules/listening/lib/listening-question-groups";
import type { ListeningQuestion } from "@/modules/listening/types";
import { cn } from "@/lib/utils";

type Props = {
  questions: ListeningQuestion[];
  instruction: string | null;
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onAnswer: (questionId: string, value: string) => void;
  onFocus: (questionId: string) => void;
};

function qNum(q: ListeningQuestion): number {
  return q.display_number ?? q.question_number;
}

function renderInline(
  q: ListeningQuestion,
  value: string,
  onChange: (v: string) => void,
  onFocus: () => void,
  isActive: boolean,
) {
  const ariaLabel = `Question ${qNum(q)}: ${q.prompt}`;
  const parts = splitPromptBlank(q.prompt);
  if (parts) {
    return (
      <SentenceInlineBlank
        before={parts.before}
        after={parts.after}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        ariaLabel={ariaLabel}
        variant="exam"
        isActive={isActive}
        questionNumber={qNum(q)}
        showQuestionNumber
      />
    );
  }
  const stripped = q.prompt
    .replace(INLINE_BLANK_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (
    <SentenceInlineBlank
      before={stripped}
      after=""
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      ariaLabel={ariaLabel}
      variant="exam"
      isActive={isActive}
      questionNumber={qNum(q)}
      showQuestionNumber
    />
  );
}

function ListeningSentenceCompletionBlockBase({
  questions,
  instruction,
  answers,
  currentQuestionId,
  onAnswer,
  onFocus,
}: Props) {
  const sorted = questions.toSorted((a, b) => qNum(a) - qNum(b));

  return (
    <article className="rounded-lg border border-[var(--exam-border)] bg-white p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--exam-accent)]">
        {blockQuestionRange(questions)}: Sentence completion
      </p>
      {instruction ? (
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--exam-ink-muted)]">
          {instruction}
        </p>
      ) : null}
      <div className="mt-4 space-y-4">
        {sorted.map((q) => (
          <div
            key={q.id}
            className={cn(
              currentQuestionId === q.id &&
                "rounded-md ring-1 ring-[var(--exam-accent)]/25",
            )}
          >
            {renderInline(
              q,
              answers[q.id] ?? "",
              (v) => onAnswer(q.id, v),
              () => onFocus(q.id),
              currentQuestionId === q.id,
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

export const ListeningSentenceCompletionBlock = memo(ListeningSentenceCompletionBlockBase);
