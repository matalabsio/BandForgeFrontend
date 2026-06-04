"use client";

import { memo, type ReactNode } from "react";
import {
  LabelInlineBlank,
  SentenceInlineBlank,
} from "@/modules/listening/components/listening-inline-answer";
import {
  shouldUseInlineBlank,
  shouldUseLabelBlank,
  splitPromptBlank,
} from "@/modules/listening/lib/inline-blank";
import type { ListeningQuestion } from "@/modules/listening/types";
import { cn } from "@/lib/utils";

type Props = {
  question: ListeningQuestion;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  isActive?: boolean;
  audioSlot?: ReactNode;
  hideMeta?: boolean;
  variant?: "default" | "exam";
};

const TFNG = ["TRUE", "FALSE", "NOT GIVEN"] as const;

function renderTextAnswer(
  question: ListeningQuestion,
  value: string,
  onChange: (value: string) => void,
  variant: "default" | "exam",
  opts: { onFocus?: () => void; isActive?: boolean; hideMeta?: boolean },
) {
  const { onFocus, isActive, hideMeta } = opts;
  const ariaLabel = `Question ${question.question_number}: ${question.prompt}`;

  if (shouldUseInlineBlank(question)) {
    const parts = splitPromptBlank(question.prompt);
    if (parts) {
      return (
        <SentenceInlineBlank
          before={parts.before}
          after={parts.after}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          ariaLabel={ariaLabel}
          variant={variant}
          isActive={isActive}
          questionNumber={question.question_number}
          showQuestionNumber={!hideMeta}
        />
      );
    }
  }

  if (shouldUseLabelBlank(question)) {
    return (
      <LabelInlineBlank
        questionNumber={question.question_number}
        label={question.prompt}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        variant={variant}
        isActive={isActive}
        layout={variant === "exam" ? "exam-form" : "legacy"}
        prefix={question.question_number === 8 ? "£" : undefined}
      />
    );
  }

  const isExam = variant === "exam";
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      aria-label={ariaLabel}
      placeholder="Your answer"
      className={cn(
        "w-full outline-none",
        isExam
          ? "mt-4 rounded-md border border-[var(--exam-border)] bg-white px-3 py-2.5 text-[14px] focus:border-[var(--exam-accent)] focus:ring-2 focus:ring-[var(--exam-accent)]/20"
          : "mt-4 rounded-lg border border-border bg-white px-3 py-2 text-body focus:border-teal focus:ring-2 focus:ring-teal/20",
      )}
    />
  );
}

function ListeningQuestionPanelBase({
  question,
  value,
  onChange,
  onFocus,
  isActive = false,
  audioSlot,
  hideMeta,
  variant = "default",
}: Props) {
  const type = question.question_type.toLowerCase();
  const options = question.options ?? null;
  const isExam = variant === "exam";
  const usesInlineLayout =
    shouldUseInlineBlank(question) || shouldUseLabelBlank(question);

  if (isExam) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {!usesInlineLayout && !hideMeta ? (
          <p className="text-[14px] font-semibold leading-snug text-[var(--exam-ink)]">
            <span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[var(--exam-bar)] text-[12px] font-bold text-white">
              {question.question_number}
            </span>
            {question.prompt}
          </p>
        ) : !usesInlineLayout && hideMeta ? (
          <p className="text-[14px] font-semibold leading-snug text-[var(--exam-ink)]">
            {question.prompt}
          </p>
        ) : null}
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
          <div className={usesInlineLayout ? undefined : "mt-0"}>
            {renderTextAnswer(question, value, onChange, "exam", {
              onFocus,
              isActive,
              hideMeta,
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      {!usesInlineLayout && hideMeta ? null : !usesInlineLayout ? (
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
      ) : null}

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
        <div className={usesInlineLayout ? "mt-2" : undefined}>
          {renderTextAnswer(question, value, onChange, "default", {
            onFocus,
            isActive,
            hideMeta,
          })}
        </div>
      )}
    </article>
  );
}

export const ListeningQuestionPanel = memo(ListeningQuestionPanelBase);
