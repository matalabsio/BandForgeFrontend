"use client";

import { memo } from "react";
import { SentenceInlineBlank } from "@/modules/listening/components/listening-inline-answer";
import {
  INLINE_BLANK_PATTERN,
  splitPromptBlank,
} from "@/modules/listening/lib/inline-blank";
import { blockQuestionRange } from "@/modules/listening/lib/listening-question-groups";
import type { ListeningQuestion, NotesSection } from "@/modules/listening/types";
import { cn } from "@/lib/utils";

type Props = {
  questions: ListeningQuestion[];
  instruction: string | null;
  notesTitle?: string | null;
  notesSections?: NotesSection[] | null;
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

function questionsForSection(
  questions: ListeningQuestion[],
  section: NotesSection,
): ListeningQuestion[] {
  return questions.filter((q) => {
    const n = qNum(q);
    return n >= section.start && n <= section.end;
  });
}

function ListeningNoteCompletionBlockBase({
  questions,
  instruction,
  notesTitle,
  notesSections,
  answers,
  currentQuestionId,
  onAnswer,
  onFocus,
}: Props) {
  const sorted = questions.toSorted((a, b) => qNum(a) - qNum(b));
  const sections =
    notesSections && notesSections.length > 0
      ? notesSections
      : sorted.length > 0
        ? [{ heading: "", start: qNum(sorted[0]), end: qNum(sorted[sorted.length - 1]) }]
        : [];

  const assigned = new Set<string>();
  const sectionRows = sections.map((section) => {
    const items = questionsForSection(sorted, section).filter((q) => !assigned.has(q.id));
    for (const q of items) assigned.add(q.id);
    return { section, items };
  });
  const orphaned = sorted.filter((q) => !assigned.has(q.id));
  if (orphaned.length > 0) {
    sectionRows.push({ section: { heading: "", start: 0, end: 0 }, items: orphaned });
  }

  return (
    <article className="rounded-lg border border-[var(--exam-border)] bg-white p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--exam-accent)]">
        {blockQuestionRange(questions)}: Note Completion
      </p>
      {instruction ? (
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--exam-ink-muted)]">
          {instruction}
        </p>
      ) : null}

      <div className="mt-4 border border-[var(--exam-border)] bg-[#fafafa] px-4 py-5 sm:px-6">
        {notesTitle ? (
          <h3 className="text-center text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--exam-ink)]">
            {notesTitle}
          </h3>
        ) : null}

        <div className={cn("space-y-5", notesTitle && "mt-5")}>
          {sectionRows.map(({ section, items }) => {
            if (items.length === 0) return null;
            return (
              <div key={`${section.heading}-${section.start}-${section.end}`}>
                {section.heading ? (
                  <h4 className="mb-2 text-[13px] font-semibold text-[var(--exam-ink)]">
                    {section.heading}
                  </h4>
                ) : null}
                <ul className="space-y-3">
                  {items.map((q) => (
                    <li
                      key={q.id}
                      className={cn(
                        "flex gap-2",
                        currentQuestionId === q.id &&
                          "rounded-md ring-1 ring-[var(--exam-accent)]/25",
                      )}
                    >
                      <span
                        className="mt-1.5 shrink-0 text-[14px] text-[var(--exam-ink)]"
                        aria-hidden
                      >
                        –
                      </span>
                      <div className="min-w-0 flex-1">
                        {renderInline(
                          q,
                          answers[q.id] ?? "",
                          (v) => onAnswer(q.id, v),
                          () => onFocus(q.id),
                          currentQuestionId === q.id,
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export const ListeningNoteCompletionBlock = memo(ListeningNoteCompletionBlockBase);
