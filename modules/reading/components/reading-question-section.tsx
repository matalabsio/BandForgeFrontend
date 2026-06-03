"use client";

import type { ReadingQuestion } from "@/modules/reading/types";
import type { QuestionGroup } from "@/modules/reading/lib/question-groups";
import { ReadingQuestionInput } from "@/modules/reading/components/reading-question-input";
import {
  type QuestionSectionId,
} from "@/modules/reading/lib/reading-exam-flow";
import { cn } from "@/lib/utils";

type Props = {
  group: QuestionGroup;
  sectionId: QuestionSectionId;
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
};

function qDisplay(q: ReadingQuestion): number {
  return q.display_number ?? q.question_number;
}

function MatchingHeadingsList({
  options,
}: {
  options: { label: string; text: string }[];
}) {
  return (
    <div className="mb-6 rounded-lg border border-[var(--reading-border)] bg-[var(--reading-surface)] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--reading-ink-muted)]">
        List of Headings
      </p>
      <ul className="mt-2 space-y-1.5">
        {options.map((o) => (
          <li
            key={o.label}
            className="text-[13px] leading-snug text-[var(--reading-ink)]"
          >
            <span className="font-semibold">{o.label}.</span> {o.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompactHeadingChoice({
  q,
  value,
  options,
  onChange,
}: {
  q: ReadingQuestion;
  value: string;
  options: { label: string; text: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.label}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[12px] font-semibold transition-colors",
            value === o.label
              ? "border-[var(--reading-accent)] bg-[var(--reading-accent-soft)] text-[var(--reading-accent)]"
              : "border-[var(--reading-border)] bg-white hover:border-[var(--reading-muted)]",
          )}
        >
          <input
            type="radio"
            name={q.id}
            value={o.label}
            checked={value === o.label}
            onChange={() => onChange(o.label)}
            className="accent-[var(--reading-accent)]"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

export function ReadingQuestionSection({
  group,
  sectionId,
  answers,
  onAnswer,
}: Props) {
  const headingOptions =
    sectionId === "matching_headings"
      ? (group.questions[0]?.options ?? [])
      : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--reading-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-[var(--reading-border)] bg-white px-4 py-3">
            <h2 className="font-display text-[15px] font-bold text-[var(--reading-ink)]">
              {group.title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--reading-ink-muted)]">
              {group.instruction}
            </p>
          </div>

          {sectionId === "matching_headings" && headingOptions.length > 0 ? (
            <MatchingHeadingsList options={headingOptions} />
          ) : null}

          <div className="mt-6 space-y-5">
            {group.questions.map((q) => (
              <article
                key={q.id}
                className="rounded-lg border border-[var(--reading-border)] bg-white p-4 shadow-sm"
              >
                <p className="text-[14px] font-semibold leading-snug text-[var(--reading-ink)]">
                  <span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[var(--reading-bar)] text-[12px] font-bold text-white">
                    {qDisplay(q)}
                  </span>
                  {q.prompt}
                </p>
                <div className="mt-3">
                  {sectionId === "matching_headings" && headingOptions.length > 0 ? (
                    <CompactHeadingChoice
                      q={q}
                      value={answers[q.id] ?? ""}
                      options={headingOptions}
                      onChange={(v) => onAnswer(q.id, v)}
                    />
                  ) : (
                    <ReadingQuestionInput
                      q={q}
                      value={answers[q.id] ?? ""}
                      onChange={(v) => onAnswer(q.id, v)}
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
