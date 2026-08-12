"use client";

import { memo, useMemo } from "react";
import type { ReadingQuestion } from "@/modules/reading/types";
import type { QuestionGroup } from "@/modules/reading/lib/question-groups";
import { ExamMatchingDnDBlock } from "@/components/exam/exam-matching-dnd-block";
import {
  type HeadingOption,
  matchingHeadingsTitle,
  normalizeRoman,
  sortHeadingOptions,
} from "@/modules/reading/lib/reading-matching-headings";

type Props = {
  group: QuestionGroup;
  options: HeadingOption[];
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
  labelFormat?: "roman" | "letter";
  normalize?: (raw: string) => string;
  poolTitle?: string;
  slotPlaceholder?: string;
};

function ReadingMatchingHeadingsBlockBase({
  group,
  options,
  answers,
  onAnswer,
  labelFormat = "roman",
  normalize = normalizeRoman,
  poolTitle = "List of headings",
  slotPlaceholder = "Drop heading here",
}: Props) {
  const questions = useMemo(
    () =>
      group.questions.toSorted(
        (a, b) =>
          (a.display_number ?? a.question_number) -
          (b.display_number ?? b.question_number),
      ),
    [group.questions],
  );

  const sortedOptions = useMemo(
    () => (labelFormat === "roman" ? sortHeadingOptions(options) : options),
    [options, labelFormat],
  );

  return (
    <article className="rounded-lg border border-[var(--reading-border)] bg-white px-4 py-4 sm:px-5">
      <h2 className="font-display text-[15px] font-bold leading-snug text-[var(--reading-ink)]">
        {labelFormat === "roman"
          ? matchingHeadingsTitle(group.title)
          : group.title}
      </h2>
      <p className="mt-2 font-serif text-[13px] italic leading-relaxed text-[var(--reading-ink-muted)]">
        {group.instruction}
      </p>

      <div className="mt-5">
        <ExamMatchingDnDBlock
          questions={questions as ReadingQuestion[]}
          options={sortedOptions}
          answers={answers}
          onAnswer={onAnswer}
          labelFormat={labelFormat}
          variant="reading"
          normalize={normalize}
          poolTitle={poolTitle}
          slotPlaceholder={slotPlaceholder}
          pendingHint="Tap a heading, then tap an empty paragraph row to assign."
          poolSticky={false}
        />
      </div>
    </article>
  );
}

export const ReadingMatchingHeadingsBlock = memo(ReadingMatchingHeadingsBlockBase);
