"use client";

import { useMemo } from "react";
import { ExamMatchingDnDBlock } from "@/components/exam/exam-matching-dnd-block";
import {
  extractHeadingOptions,
  normalizeRoman,
  sortHeadingOptions,
} from "@/modules/reading/lib/reading-matching-headings";
import type { ReadingQuestion } from "@/modules/reading/types";

const MATCHING_INSTRUCTION =
  "The passage has seven paragraphs, A–G. Choose the correct heading for Paragraphs C–F from the list of headings below. Write the correct number, i–vii.";

type Props = {
  questions: ReadingQuestion[];
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
};

export function DiagnosticReadingMatchingHeadings({
  questions,
  answers,
  onAnswer,
}: Props) {
  const sortedQuestions = useMemo(
    () =>
      questions.toSorted(
        (a, b) =>
          (a.display_number ?? a.question_number) -
          (b.display_number ?? b.question_number),
      ),
    [questions],
  );

  const options = useMemo(() => {
    const raw =
      sortedQuestions.find((q) => q.options && q.options.length > 0)?.options ??
      [];
    return sortHeadingOptions(
      raw.map((o) => ({
        label: normalizeRoman(o.label) || o.label.trim().toLowerCase(),
        text: o.text.replace(/^[ivx]+\.\s*/i, ""),
      })),
    );
  }, [sortedQuestions]);

  const qStart = sortedQuestions[0]?.question_number ?? 6;
  const qEnd = sortedQuestions[sortedQuestions.length - 1]?.question_number ?? 9;

  return (
    <li className="list-none">
      <div className="rounded-xl border border-navy/10 bg-white p-4 sm:p-5">
        <p className="font-mono text-[11px] tracking-wide text-teal uppercase">
          Questions {qStart}–{qEnd}: Matching headings
        </p>
        <p className="mt-2 text-[13.5px] leading-snug font-light text-[#3D4D63]">
          {MATCHING_INSTRUCTION}
        </p>
        <div className="mt-5">
          <ExamMatchingDnDBlock
            questions={sortedQuestions}
            options={options}
            answers={answers}
            onAnswer={onAnswer}
            labelFormat="roman"
            variant="reading"
            normalize={normalizeRoman}
            poolTitle="List of headings"
            slotPlaceholder="Choose heading"
            pendingHint="Tap a heading, then tap a paragraph row to assign."
            poolSticky={false}
          />
        </div>
      </div>
    </li>
  );
}
