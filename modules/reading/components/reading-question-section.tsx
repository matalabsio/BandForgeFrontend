"use client";

import type { ReadingQuestion } from "@/modules/reading/types";
import type { QuestionGroup } from "@/modules/reading/lib/question-groups";
import { SentenceInlineBlank } from "@/modules/listening/components/listening-inline-answer";
import { ReadingMatchingHeadingsBlock } from "@/modules/reading/components/reading-matching-headings-block";
import { ReadingQuestionInput } from "@/modules/reading/components/reading-question-input";
import { extractHeadingOptions } from "@/modules/reading/lib/reading-matching-headings";
import {
  type QuestionSectionId,
} from "@/modules/reading/lib/reading-exam-flow";
import {
  INLINE_BLANK_PATTERN,
  shouldUseReadingInlineBlank,
  splitPromptBlank,
} from "@/modules/reading/lib/reading-inline-blank";
type Props = {
  group: QuestionGroup;
  sectionId: QuestionSectionId;
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
};

function qDisplay(q: ReadingQuestion): number {
  return q.display_number ?? q.question_number;
}

function ReadingSentenceInline({
  q,
  value,
  onChange,
}: {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  const num = qDisplay(q);
  const ariaLabel = `Question ${num}: ${q.prompt}`;
  const parts = splitPromptBlank(q.prompt);
  if (parts) {
    return (
      <SentenceInlineBlank
        before={parts.before}
        after={parts.after}
        value={value}
        onChange={onChange}
        ariaLabel={ariaLabel}
        variant="reading"
        questionNumber={num}
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
      ariaLabel={ariaLabel}
      variant="reading"
      questionNumber={num}
      showQuestionNumber
    />
  );
}

export function ReadingQuestionSection({
  group,
  sectionId,
  answers,
  onAnswer,
}: Props) {
  if (sectionId === "matching_headings") {
    const headingOptions = extractHeadingOptions(group);
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-[var(--reading-surface)]">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <ReadingMatchingHeadingsBlock
              group={group}
              options={headingOptions}
              answers={answers}
              onAnswer={onAnswer}
            />
          </div>
        </div>
      </div>
    );
  }

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

          <div className="mt-6 space-y-5">
            {group.questions.map((q) => {
              const useInline = shouldUseReadingInlineBlank(q);
              return (
                <article
                  key={q.id}
                  className="rounded-lg border border-[var(--reading-border)] bg-white p-4 shadow-sm"
                >
                  {useInline ? (
                    <ReadingSentenceInline
                      q={q}
                      value={answers[q.id] ?? ""}
                      onChange={(v) => onAnswer(q.id, v)}
                    />
                  ) : (
                    <>
                      <p className="text-[14px] font-semibold leading-snug text-[var(--reading-ink)]">
                        <span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[var(--reading-bar)] text-[12px] font-bold text-white">
                          {qDisplay(q)}
                        </span>
                        {q.prompt}
                      </p>
                      <div className="mt-3">
                        <ReadingQuestionInput
                          q={q}
                          value={answers[q.id] ?? ""}
                          onChange={(v) => onAnswer(q.id, v)}
                        />
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
