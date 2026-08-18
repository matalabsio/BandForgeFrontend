"use client";

import { memo, type ReactNode } from "react";
import {
  LabelInlineBlank,
  SentenceInlineBlank,
} from "@/modules/listening/components/listening-inline-answer";
import {
  INLINE_BLANK_PATTERN,
  shouldUseInlineBlank,
  shouldUseLabelBlank,
  splitPromptBlank,
  usesInlineAnswerLayout,
} from "@/modules/listening/lib/inline-blank";
import type { ListeningQuestion } from "@/modules/listening/types";
import { cn } from "@/lib/utils";
import {
  listeningOptionLetter,
  listeningOptionsHaveUniqueLetters,
  listeningOptionValue,
} from "@/modules/listening/lib/listening-option-value";
import { RichText, richTextToPlain } from "@/components/rich-text";

type Props = {
  question: ListeningQuestion;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  isActive?: boolean;
  audioSlot?: ReactNode;
  hideMeta?: boolean;
  variant?: "default" | "exam" | "diagnostic";
};

const TFNG = ["TRUE", "FALSE", "NOT GIVEN"] as const;

function isMcqOptionSelected(
  value: string,
  options: Array<{ label: string }>,
  optionIndex: number,
  label: string,
): boolean {
  const token = listeningOptionValue(optionIndex, label);
  if (value === token) return true;
  // Legacy plain-label answers: only the first option with that label stays selected
  return (
    value === label &&
    !value.includes("::") &&
    options.findIndex((x) => x.label === label) === optionIndex
  );
}

function mcqDisplayLetter(
  options: Array<{ label: string }>,
  optionIndex: number,
  label: string,
): string {
  return listeningOptionsHaveUniqueLetters(options)
    ? label
    : listeningOptionLetter(optionIndex);
}

function mcqDisplayText(o: { label: string; text?: string }): string {
  const text = (o.text ?? "").trim();
  if (text && text !== o.label.trim()) return text;
  return text || o.label;
}

function renderTextAnswer(
  question: ListeningQuestion,
  value: string,
  onChange: (value: string) => void,
  variant: "default" | "exam" | "diagnostic",
  opts: { onFocus?: () => void; isActive?: boolean; hideMeta?: boolean },
) {
  const { onFocus, isActive, hideMeta } = opts;
  const ariaLabel = `Question ${question.question_number}: ${richTextToPlain(question.prompt)}`;
  const inlineVariant = variant === "diagnostic" ? "exam" : variant;

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
          variant={inlineVariant}
          isActive={isActive}
          questionNumber={question.question_number}
          showQuestionNumber={!hideMeta}
        />
      );
    }
    const stripped = question.prompt.replace(INLINE_BLANK_PATTERN, " ").trim();
    return (
      <SentenceInlineBlank
        before={stripped}
        after=""
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        ariaLabel={ariaLabel}
        variant={inlineVariant}
        isActive={isActive}
        questionNumber={question.question_number}
        showQuestionNumber={!hideMeta}
      />
    );
  }

  if (shouldUseLabelBlank(question)) {
    return (
      <LabelInlineBlank
        questionNumber={question.question_number}
        label={question.prompt}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        variant={inlineVariant}
        isActive={isActive}
        layout={inlineVariant === "exam" ? "exam-form" : "legacy"}
        prefix={question.question_number === 8 ? "£" : undefined}
      />
    );
  }

  const isExamStyle = variant === "exam" || variant === "diagnostic";
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
        isExamStyle
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
  const isDiagnostic = variant === "diagnostic";
  const usesInlineLayout = usesInlineAnswerLayout(question);

  if (isDiagnostic) {
    return (
      <div>
        {!usesInlineLayout && !hideMeta ? (
          <>
            <p className="mb-3.5 font-mono text-xs tracking-wide text-[#6E83A0]">
              Question {question.question_number}
            </p>
            <p className="font-display text-lg font-normal tracking-tight text-navy break-words">
              <RichText text={question.instructions ?? question.prompt} />
            </p>
            {question.instructions && question.prompt !== question.instructions ? (
              <p className="mt-1 text-sm font-light text-[#5A6B82] break-words">
                <RichText text={question.prompt} />
              </p>
            ) : null}
          </>
        ) : null}
        {audioSlot ? <div className="mt-3">{audioSlot}</div> : null}
        {options && options.length > 0 ? (
          <fieldset className="mt-4 space-y-2.5">
            <legend className="sr-only">Options</legend>
            {options.map((o, optionIndex) => {
              const token = listeningOptionValue(optionIndex, o.label);
              const selected = isMcqOptionSelected(
                value,
                options,
                optionIndex,
                o.label,
              );
              const displayLetter = mcqDisplayLetter(options, optionIndex, o.label);
              const displayText = mcqDisplayText(o);
              return (
                <label
                  key={`${question.id}-opt-${optionIndex}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[13px] border px-4 py-3.5 transition-colors",
                    selected
                      ? "border-cyan bg-cyan/10"
                      : "border-navy/14 bg-white hover:border-navy/25",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-[7px] border-[1.5px]",
                      selected
                        ? "border-cyan bg-cyan text-[#06222B]"
                        : "border-navy/22",
                    )}
                  >
                    {selected ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M5 12l5 5L20 6" />
                      </svg>
                    ) : null}
                  </span>
                  <span className="mt-0.5 font-mono text-[13px] font-medium text-teal shrink-0">
                    {displayLetter}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 break-words text-sm",
                      selected ? "font-medium text-navy" : "text-[#3D4D63]",
                    )}
                  >
                    {displayText}
                  </span>
                  <input
                    type="radio"
                    name={question.id}
                    value={token}
                    checked={selected}
                    onChange={() => onChange(token)}
                    className="sr-only"
                  />
                </label>
              );
            })}
          </fieldset>
        ) : type === "tfng" ? (
          <div className="mt-4 flex flex-col gap-2.5">
            {TFNG.map((t) => {
              const selected = value === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange(t)}
                  className={cn(
                    "flex min-h-[52px] cursor-pointer items-start gap-3 rounded-[13px] border px-4 py-3.5 text-left text-[15px] transition-colors break-words",
                    selected
                      ? "border-cyan bg-cyan/10 font-semibold text-navy"
                      : "border-navy/14 text-[#3D4D63]",
                  )}
                >
                  <span
                    className={cn(
                      "size-[22px] shrink-0 rounded-full border-[1.5px]",
                      selected ? "border-cyan bg-cyan" : "border-navy/22",
                    )}
                  />
                  {t}
                </button>
              );
            })}
          </div>
        ) : (
          <div className={usesInlineLayout ? undefined : "mt-4"}>
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

  if (isExam) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {!usesInlineLayout && !hideMeta ? (
          <p className="text-[14px] font-normal leading-snug text-[var(--exam-ink)]">
            <span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[var(--exam-bar)] text-[12px] font-bold text-white">
              {question.question_number}
            </span>
            <RichText text={question.prompt} />
          </p>
        ) : !usesInlineLayout && hideMeta ? (
          <p className="text-[14px] font-normal leading-snug text-[var(--exam-ink)]">
            <RichText text={question.prompt} />
          </p>
        ) : null}
        {audioSlot ? <div className="mt-3">{audioSlot}</div> : null}
        {options && options.length > 0 ? (
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Options</legend>
            {options.map((o, optionIndex) => {
              const token = listeningOptionValue(optionIndex, o.label);
              const selected = isMcqOptionSelected(
                value,
                options,
                optionIndex,
                o.label,
              );
              const displayLetter = mcqDisplayLetter(options, optionIndex, o.label);
              const displayText = mcqDisplayText(o);
              return (
                <label
                  key={`${question.id}-opt-${optionIndex}`}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--exam-border)] bg-[var(--exam-surface)] px-3 py-2.5 text-[13px] has-[:checked]:border-[var(--exam-accent)] has-[:checked]:bg-[var(--exam-accent-soft)]"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={token}
                    checked={selected}
                    onChange={() => onChange(token)}
                    className="mt-0.5 accent-[var(--exam-accent)]"
                  />
                  <span className="text-[var(--exam-ink)]">
                    <span className="font-bold">{displayLetter}.</span> {displayText}
                  </span>
                </label>
              );
            })}
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
              <RichText text={question.instructions} />
            </p>
          ) : null}
          <p className="mt-2 text-body text-ink">
            <RichText text={question.prompt} />
          </p>
        </header>
      ) : null}

      {audioSlot ? <div className="mt-3">{audioSlot}</div> : null}

      {options && options.length > 0 ? (
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Options</legend>
          {options.map((o, optionIndex) => {
            const token = listeningOptionValue(optionIndex, o.label);
            const selected = isMcqOptionSelected(
              value,
              options,
              optionIndex,
              o.label,
            );
            const displayLetter = mcqDisplayLetter(options, optionIndex, o.label);
            const displayText = mcqDisplayText(o);
            return (
              <label
                key={`${question.id}-opt-${optionIndex}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-body has-[:checked]:border-teal has-[:checked]:bg-teal/5"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={token}
                  checked={selected}
                  onChange={() => onChange(token)}
                  className="mt-1 accent-teal"
                />
                <span>
                  <span className="font-semibold text-navy">{displayLetter}.</span>{" "}
                  {displayText}
                </span>
              </label>
            );
          })}
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
