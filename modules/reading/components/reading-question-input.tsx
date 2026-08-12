"use client";

import type { ReadingQuestion } from "@/modules/reading/types";
import { examTextInputProps } from "@/lib/exam-input-props";
import { BF_PRIMARY_FILL } from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

const TFNG_DEFAULT = ["TRUE", "FALSE", "NOT GIVEN"] as const;

function choiceLabels(q: ReadingQuestion): readonly string[] {
  const opts = q.options;
  if (opts && opts.length > 0) {
    return opts.map((o) => o.label || o.text);
  }
  return TFNG_DEFAULT;
}

type Props = {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
};

export function ReadingQuestionInput({ q, value, onChange }: Props) {
  const type = q.question_type.toLowerCase();
  const choices = choiceLabels(q);

  if (type === "tfng" || choices.length > 0) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {choices.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-[12px] font-bold tracking-wide transition-colors",
              value === t
                ? cn(
                    BF_PRIMARY_FILL,
                    "border-transparent shadow-[0_4px_12px_rgb(0_151_167/0.28)]",
                  )
                : "border-[var(--reading-border)] bg-white text-[var(--reading-ink)] hover:border-[var(--reading-accent)]",
            )}
          >
            {t}
          </button>
        ))}
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...examTextInputProps}
      aria-label={`Question ${q.display_number ?? q.question_number}: answer`}
      placeholder="Type your answer"
      className="mt-3 w-full max-w-md rounded-md border border-[var(--reading-border)] bg-white px-3 py-2.5 text-[14px] text-[var(--reading-ink)] outline-none transition-shadow focus:border-[var(--reading-accent)] focus:ring-2 focus:ring-[var(--reading-accent)]/20"
    />
  );
}
