"use client";

import {
  ExamAnswerSheetNav,
  type ExamAnswerSheetItem,
} from "@/modules/shared/components/exam-answer-sheet-nav";

export type ReadingAnswerSheetItem = ExamAnswerSheetItem;

type Props = {
  questions: ReadingAnswerSheetItem[];
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onJump: (id: string) => void;
  /** Use BandForge navy/cyan tokens instead of --reading-* CSS vars. */
  tone?: "exam" | "diagnostic";
};

export function ReadingAnswerSheet({
  questions,
  answers,
  currentQuestionId,
  onJump,
  tone = "exam",
}: Props) {
  return (
    <ExamAnswerSheetNav
      questions={questions}
      answers={answers}
      currentQuestionId={currentQuestionId}
      onSelect={onJump}
      palette={tone === "diagnostic" ? "diagnostic" : "reading"}
    />
  );
}
