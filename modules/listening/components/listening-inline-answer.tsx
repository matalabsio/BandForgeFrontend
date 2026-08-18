"use client";

import { cn } from "@/lib/utils";
import { RichText, richTextToPlain } from "@/components/rich-text";

type Variant = "default" | "exam" | "reading";

type SentenceInlineBlankProps = {
  before: string;
  after: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  ariaLabel: string;
  variant?: Variant;
  isActive?: boolean;
  questionNumber?: number;
  showQuestionNumber?: boolean;
};

export function SentenceInlineBlank({
  before,
  after,
  value,
  onChange,
  onFocus,
  ariaLabel,
  variant = "exam",
  isActive = false,
  questionNumber,
  showQuestionNumber = true,
}: SentenceInlineBlankProps) {
  const isExam = variant === "exam";
  const isReading = variant === "reading";

  return (
    <div
      className={cn(
        isExam && isActive && "rounded-sm bg-[#e8e8e8] px-1 py-0.5 ring-1 ring-[#18181b]/45",
        isReading &&
          isActive &&
          "rounded-sm bg-[var(--reading-accent-soft)]/40 px-1 py-0.5 ring-1 ring-[var(--reading-accent)]/25",
        !isExam && !isReading && isActive && "rounded-lg ring-2 ring-teal/30 ring-offset-2",
      )}
    >
      <p
        className={cn(
          "font-normal leading-relaxed",
          isExam && "text-[14px] text-[var(--exam-ink)]",
          isReading && "text-[14px] text-[var(--reading-ink)]",
          !isExam && !isReading && "text-body text-ink",
        )}
      >
        {showQuestionNumber && questionNumber != null ? (
          <span
            className={cn(
              "mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-md text-[12px] font-bold text-white",
              isExam && "bg-[var(--exam-bar)]",
              isReading && "bg-[var(--reading-bar)]",
              !isExam && !isReading && "bg-teal",
            )}
          >
            {questionNumber}
          </span>
        ) : null}
        {before ? (
          <span>
            <RichText text={before} />{" "}
          </span>
        ) : null}
        <span className="inline-flex max-w-full items-baseline align-baseline">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            aria-label={ariaLabel}
            autoComplete="off"
            spellCheck={false}
            className={cn(
              "mx-0.5 min-w-[5rem] max-w-full border-0 border-b-2 bg-transparent px-0.5 py-0 text-[14px] outline-none",
              isExam &&
                "border-[var(--exam-ink)] text-[var(--exam-ink)] focus:border-[var(--exam-accent)] focus:ring-0",
              isReading &&
                "border-[var(--reading-ink)] text-[var(--reading-ink)] focus:border-[var(--reading-accent)] focus:ring-0",
              !isExam &&
                !isReading &&
                "border-ink/40 font-mono text-ink focus:border-teal",
            )}
          />
        </span>
        {after ? (
          <span>
            {" "}
            <RichText text={after} />
          </span>
        ) : null}
      </p>
    </div>
  );
}

type LabelInlineBlankProps = {
  questionNumber: number;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  variant?: Variant;
  isActive?: boolean;
  prefix?: string;
  /** Exam form grid: number | label | input columns */
  layout?: "exam-form" | "legacy";
};

export function LabelInlineBlank({
  questionNumber,
  label,
  value,
  onChange,
  onFocus,
  variant = "exam",
  isActive = false,
  prefix,
  layout,
}: LabelInlineBlankProps) {
  const isExam = variant === "exam";
  const useExamForm = layout === "exam-form" || (layout == null && isExam);

  const input = (
    <>
      {prefix ? (
        <span
          className={cn(
            "shrink-0 text-[13px]",
            isExam ? "text-[#52525b]" : "text-ink/60",
          )}
        >
          {prefix}
        </span>
      ) : null}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        aria-label={`Question ${questionNumber}: ${richTextToPlain(label)}`}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent outline-none",
          isExam
            ? "text-[14px] text-[#18181b] placeholder:text-[#d4d4d8]"
            : "font-mono text-[13px] text-ink placeholder:text-ink/30",
        )}
        placeholder={isExam ? "" : "………………"}
      />
    </>
  );

  if (useExamForm) {
    return (
      <div
        className={cn(
          "grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1 sm:grid-cols-[2.5rem_8rem_1fr]",
          isActive && "rounded-sm bg-[#e8e8e8] ring-1 ring-[#18181b]/45",
        )}
      >
        <span className="font-mono text-[12px] font-semibold tabular-nums text-[#18181b]">
          {questionNumber}
        </span>
        <span className="text-[13px] font-normal text-[#52525b] sm:col-start-2">
          <RichText text={label} />
        </span>
        <span className="col-span-2 flex min-w-0 items-baseline gap-1 border-b border-[#18181b] pb-0.5 sm:col-span-1 sm:col-start-3">
          {input}
        </span>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3",
        isActive && "rounded-lg ring-2 ring-teal/30 ring-offset-2",
      )}
    >
      <span className="min-w-[10rem] shrink-0 text-[12px] font-normal text-ink/70">
        ({questionNumber}) <RichText text={label} />:
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-1 border-b border-ink/25 pb-1">
        {input}
      </span>
    </label>
  );
}
