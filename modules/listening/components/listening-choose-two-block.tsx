"use client";

import { memo, useCallback } from "react";
import type { ListeningOption, ListeningQuestion } from "@/modules/listening/types";
import { blockQuestionRange } from "@/modules/listening/lib/listening-question-groups";
import { cn } from "@/lib/utils";

type Props = {
  questions: [ListeningQuestion, ListeningQuestion];
  instruction: string | null;
  stem: string;
  options: ListeningOption[];
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onAnswer: (questionId: string, value: string) => void;
  onFocus: (questionId: string) => void;
};

function qNum(q: ListeningQuestion): number {
  return q.display_number ?? q.question_number;
}

function ListeningChooseTwoBlockBase({
  questions,
  instruction,
  stem,
  options,
  answers,
  currentQuestionId,
  onAnswer,
  onFocus,
}: Props) {
  const ordered = questions.toSorted((a, b) => qNum(a) - qNum(b));
  const [qLow, qHigh] = ordered;

  const selected = [answers[qLow.id] ?? "", answers[qHigh.id] ?? ""].filter(Boolean);

  const handleToggle = useCallback(
    (letter: string) => {
      const low = answers[qLow.id] ?? "";
      const high = answers[qHigh.id] ?? "";
      const current = [low, high].filter(Boolean);
      const has = current.includes(letter);
      let next: string[];
      if (has) {
        next = current.filter((l) => l !== letter);
      } else if (current.length < 2) {
        next = [...current, letter];
      } else {
        return;
      }
      onAnswer(qLow.id, next[0] ?? "");
      onAnswer(qHigh.id, next[1] ?? "");
      onFocus(qLow.id);
    },
    [answers, qLow.id, qHigh.id, onAnswer, onFocus],
  );

  const active = questions.some((q) => currentQuestionId === q.id);

  return (
    <article
      className={cn(
        "rounded-lg border border-[var(--exam-border)] bg-white p-4 sm:p-5",
        active && "ring-1 ring-[var(--exam-accent)]/30",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--exam-accent)]">
        {blockQuestionRange(questions)}
      </p>
      {instruction ? (
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--exam-ink-muted)]">
          {instruction}
        </p>
      ) : null}
      <p className="mt-3 text-[14px] font-semibold leading-snug text-[var(--exam-ink)]">
        {stem}
      </p>
      <p className="mt-1 text-[11px] text-[var(--exam-ink-muted)]">
        Select exactly two options ({selected.length}/2 selected).
      </p>
      <fieldset className="mt-4 space-y-2">
        <legend className="sr-only">{stem}</legend>
        {options.map((o) => {
          const checked = selected.includes(o.label);
          return (
            <label
              key={o.label}
              className={cn(
                "flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-[13px] transition-colors",
                checked
                  ? "border-[var(--exam-accent)] bg-[var(--exam-accent-soft)]"
                  : "border-[var(--exam-border)] bg-[var(--exam-surface)] hover:border-[var(--exam-ink-muted)]",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(o.label)}
                className="mt-1 size-4 shrink-0 accent-[var(--exam-accent)]"
              />
              <span className="text-[var(--exam-ink)]">
                <span className="font-bold">{o.label}.</span> {o.text}
              </span>
            </label>
          );
        })}
      </fieldset>
    </article>
  );
}

export const ListeningChooseTwoBlock = memo(ListeningChooseTwoBlockBase);
