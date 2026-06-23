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
  variant?: "exam" | "diagnostic";
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
  variant = "exam",
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
  const isDiagnostic = variant === "diagnostic";

  return (
    <article
      className={cn(
        isDiagnostic
          ? "rounded-[13px] border-0 bg-transparent p-0"
          : "rounded-lg border border-[var(--exam-border)] bg-white p-4 sm:p-5",
        !isDiagnostic && active && "ring-1 ring-[var(--exam-accent)]/30",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-bold tracking-[0.14em] uppercase",
          isDiagnostic ? "font-mono text-[#6E83A0]" : "text-[var(--exam-accent)]",
        )}
      >
        {blockQuestionRange(questions)}
      </p>
      {instruction ? (
        <p
          className={cn(
            "mt-2 leading-relaxed",
            isDiagnostic
              ? "font-display text-lg font-bold text-navy break-words"
              : "text-[12px] text-[var(--exam-ink-muted)]",
          )}
        >
          {instruction}
        </p>
      ) : null}
      <p
        className={cn(
          "mt-3 leading-snug",
          isDiagnostic
            ? "text-sm font-light text-[#5A6B82]"
            : "text-[14px] font-semibold text-[var(--exam-ink)]",
        )}
      >
        {stem}
      </p>
      <p className="mt-1 text-[11px] text-[#6E83A0]">
        Select exactly two options ({selected.length}/2 selected).
      </p>
      <fieldset className="mt-4 space-y-2.5">
        <legend className="sr-only">{stem}</legend>
        {options.map((o) => {
          const checked = selected.includes(o.label);
          return (
            <label
              key={o.label}
              className={cn(
                "flex min-h-[52px] cursor-pointer items-start gap-3 rounded-[13px] border px-4 py-3.5 text-[13px] transition-colors",
                isDiagnostic
                  ? checked
                    ? "border-cyan bg-cyan/10"
                    : "border-navy/14 bg-white"
                  : checked
                    ? "border-[var(--exam-accent)] bg-[var(--exam-accent-soft)]"
                    : "border-[var(--exam-border)] bg-[var(--exam-surface)] hover:border-[var(--exam-ink-muted)]",
              )}
            >
              {isDiagnostic ? (
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-[7px] border-[1.5px]",
                    checked ? "border-cyan bg-cyan text-[#06222B]" : "border-navy/22",
                  )}
                >
                  {checked ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12l5 5L20 6" />
                    </svg>
                  ) : null}
                </span>
              ) : (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggle(o.label)}
                  className="mt-1 size-4 shrink-0 accent-[var(--exam-accent)]"
                />
              )}
              <span className="mt-0.5 shrink-0 font-mono font-medium text-teal">{o.label}</span>
              <span className={cn("min-w-0 flex-1 break-words text-sm", checked ? "font-medium text-navy" : "text-[#3D4D63]")}>
                {o.text}
              </span>
              {isDiagnostic ? (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggle(o.label)}
                  className="sr-only"
                />
              ) : null}
            </label>
          );
        })}
      </fieldset>
    </article>
  );
}

export const ListeningChooseTwoBlock = memo(ListeningChooseTwoBlockBase);
