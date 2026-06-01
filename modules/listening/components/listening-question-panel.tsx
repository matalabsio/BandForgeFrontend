"use client";

import { memo, type ReactNode } from "react";
import type { ListeningQuestion } from "@/modules/listening/types";

type Props = {
  question: ListeningQuestion;
  value: string;
  onChange: (value: string) => void;
  audioSlot?: ReactNode;
  hideMeta?: boolean;
  variant?: "default" | "exam";
};

const TFNG = ["TRUE", "FALSE", "NOT GIVEN"] as const;

function ListeningQuestionPanelBase({
  question,
  value,
  onChange,
  audioSlot,
  hideMeta,
  variant = "default",
}: Props) {
  const type = question.question_type.toLowerCase();
  const options = question.options ?? null;
  const isExam = variant === "exam";

  if (isExam) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {!hideMeta ? (
          <p className="text-[14px] font-semibold leading-snug text-[var(--exam-ink)]">
            <span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[var(--exam-bar)] text-[12px] font-bold text-white">
              {question.question_number}
            </span>
            {question.prompt}
          </p>
        ) : (
          <p className="text-[14px] font-semibold leading-snug text-[var(--exam-ink)]">
            {question.prompt}
          </p>
        )}
        {audioSlot ? <div className="mt-3">{audioSlot}</div> : null}
        {options && options.length > 0 ? (
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Options</legend>
            {options.map((o) => (
              <label
                key={o.label}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--exam-border)] bg-[var(--exam-surface)] px-3 py-2.5 text-[13px] has-[:checked]:border-[var(--exam-accent)] has-[:checked]:bg-[var(--exam-accent-soft)]"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={o.label}
                  checked={value === o.label}
                  onChange={() => onChange(o.label)}
                  className="mt-0.5 accent-[var(--exam-accent)]"
                />
                <span className="text-[var(--exam-ink)]">
                  <span className="font-bold">{o.label}.</span> {o.text}
                </span>
              </label>
            ))}
          </fieldset>
        ) : type === "tfng" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {TFNG.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange(t)}
                className={`min-h-[44px] cursor-pointer rounded-md border px-4 text-[12px] font-bold transition-colors ${
                  value === t
                    ? "border-[var(--exam-accent)] bg-[var(--exam-accent)] text-white"
                    : "border-[var(--exam-border)] bg-white text-[var(--exam-ink)] hover:border-[var(--exam-accent)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your answer"
            className="mt-4 w-full rounded-md border border-[var(--exam-border)] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[var(--exam-accent)] focus:ring-2 focus:ring-[var(--exam-accent)]/20"
          />
        )}
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      {hideMeta ? null : (
        <header>
          <p className="text-meta font-semibold uppercase tracking-wider text-teal">
            Q{question.question_number} · {question.question_type}
            {question.skill_tag ? ` · ${question.skill_tag}` : ""}
          </p>
          {question.instructions ? (
            <p className="mt-1 text-[12px] italic text-ink/60">
              {question.instructions}
            </p>
          ) : null}
          <p className="mt-2 text-body text-ink">{question.prompt}</p>
        </header>
      )}

      {audioSlot ? <div className="mt-3">{audioSlot}</div> : null}

      {options && options.length > 0 ? (
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Options</legend>
          {options.map((o) => (
            <label
              key={o.label}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-body has-[:checked]:border-teal has-[:checked]:bg-teal/5"
            >
              <input
                type="radio"
                name={question.id}
                value={o.label}
                checked={value === o.label}
                onChange={() => onChange(o.label)}
                className="mt-1 accent-teal"
              />
              <span>
                <span className="font-semibold text-navy">{o.label}.</span> {o.text}
              </span>
            </label>
          ))}
        </fieldset>
      ) : type === "tfng" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {TFNG.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              className={`min-h-[44px] rounded-lg border px-4 text-meta font-semibold transition-colors ${
                value === t
                  ? "border-teal bg-teal text-white"
                  : "border-border bg-surface text-navy hover:bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          className="mt-4 w-full rounded-lg border border-border bg-white px-3 py-2 text-body outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      )}
    </article>
  );
}

export const ListeningQuestionPanel = memo(ListeningQuestionPanelBase);
