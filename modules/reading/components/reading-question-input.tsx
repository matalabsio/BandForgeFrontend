"use client";

import type { ReadingQuestion } from "@/modules/reading/types";
import { cn } from "@/lib/utils";

const TFNG = ["TRUE", "FALSE", "NOT GIVEN"] as const;

type Props = {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
};

export function ReadingQuestionInput({ q, value, onChange }: Props) {
  const opts = q.options;
  const type = q.question_type.toLowerCase();

  if (opts && opts.length > 0 && type === "matching_headings") {
    return (
      <div className="mt-3 grid gap-1.5 sm:grid-cols-1">
        {opts.map((o) => (
          <label
            key={o.label}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-[13px] leading-snug transition-colors",
              value === o.label
                ? "border-[var(--reading-accent)] bg-[var(--reading-accent-soft)]"
                : "border-[var(--reading-border)] bg-white hover:border-[var(--reading-muted)]",
            )}
          >
            <input
              type="radio"
              name={q.id}
              value={o.label}
              checked={value === o.label}
              onChange={() => onChange(o.label)}
              className="mt-0.5 accent-[var(--reading-accent)]"
            />
            <span>
              <span className="font-semibold text-[var(--reading-ink)]">{o.label}</span>
              <span className="text-[var(--reading-ink-muted)]">: {o.text}</span>
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (type === "tfng" || (opts && opts.length > 0)) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {TFNG.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={cn(
              "cursor-pointer rounded-md border px-4 py-2 text-[12px] font-bold tracking-wide transition-colors",
              value === t
                ? "border-[var(--reading-accent)] bg-[var(--reading-accent)] text-white"
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
      aria-label={`Question ${q.display_number ?? q.question_number}: answer`}
      placeholder="Type your answer"
      className="mt-3 w-full max-w-md rounded-md border border-[var(--reading-border)] bg-white px-3 py-2.5 text-[14px] text-[var(--reading-ink)] outline-none transition-shadow focus:border-[var(--reading-accent)] focus:ring-2 focus:ring-[var(--reading-accent)]/20"
    />
  );
}
