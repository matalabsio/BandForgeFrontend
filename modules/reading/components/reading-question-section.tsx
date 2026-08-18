"use client";

import type { ReadingQuestion } from "@/modules/reading/types";
import type { QuestionGroup } from "@/modules/reading/lib/question-groups";
import { SentenceInlineBlank } from "@/modules/listening/components/listening-inline-answer";
import { ReadingMatchingHeadingsBlock } from "@/modules/reading/components/reading-matching-headings-block";
import { ReadingQuestionInput } from "@/modules/reading/components/reading-question-input";
import {
  extractHeadingOptions,
  extractLetterMatchingOptions,
  isReadingMatchingType,
  matchingLabelFormat,
  normalizeReadingLetter,
  normalizeRoman,
} from "@/modules/reading/lib/reading-matching-headings";
import {
  type QuestionSectionId,
} from "@/modules/reading/lib/reading-exam-flow";
import {
  INLINE_BLANK_PATTERN,
  shouldUseReadingInlineBlank,
  splitPromptBlank,
} from "@/modules/reading/lib/reading-inline-blank";
import { RichText, richTextToPlain } from "@/components/rich-text";
type Props = {
  group: QuestionGroup;
  sectionId: QuestionSectionId;
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
  /** pane = mock (one section fills the right column). stack = practice (all groups in one scroller). */
  layout?: "pane" | "stack";
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
  const ariaLabel = `Question ${num}: ${richTextToPlain(q.prompt)}`;
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
  layout = "pane",
}: Props) {
  const stacked = layout === "stack";

  const body = (() => {
    if (isReadingMatchingType(group.id) || sectionId === "matching_headings") {
      const format = matchingLabelFormat(group.id);
      const headingOptions =
        format === "roman"
          ? extractHeadingOptions(group)
          : extractLetterMatchingOptions(group);
      return (
        <ReadingMatchingHeadingsBlock
          group={group}
          options={headingOptions}
          answers={answers}
          onAnswer={onAnswer}
          labelFormat={format}
          normalize={
            format === "roman" ? normalizeRoman : normalizeReadingLetter
          }
          poolTitle={format === "roman" ? "List of headings" : "Options"}
          slotPlaceholder={
            format === "roman" ? "Drop heading here" : "Drop option here"
          }
        />
      );
    }

    return (
      <>
        <div className="rounded-lg border border-[var(--reading-border)] bg-white px-4 py-3">
          <h2 className="font-display text-[15px] font-bold text-[var(--reading-ink)]">
            {group.title}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--reading-ink-muted)]">
            <RichText text={group.instruction} />
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {group.questions.map((q) => {
            const useInline = shouldUseReadingInlineBlank(q);
            return (
              <article
                key={q.id}
                className="rounded-lg border border-[var(--reading-border)] bg-white p-3 shadow-sm sm:p-4"
              >
                {useInline ? (
                  <ReadingSentenceInline
                    q={q}
                    value={answers[q.id] ?? ""}
                    onChange={(v) => onAnswer(q.id, v)}
                  />
                ) : (
                  <>
                    <div className="text-[14px] font-normal leading-snug text-[var(--reading-ink)]">
                      <span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[var(--reading-bar)] text-[12px] font-bold text-white">
                        {qDisplay(q)}
                      </span>
                      <RichText text={q.prompt} />
                    </div>
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
      </>
    );
  })();

  if (stacked) {
    return (
      <div className="shrink-0 bg-[var(--reading-surface)]">{body}</div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--reading-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-2xl">{body}</div>
      </div>
    </div>
  );
}
