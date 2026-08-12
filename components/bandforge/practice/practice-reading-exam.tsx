"use client";

import { useMemo, useState } from "react";
import { IeltsExamToolbar } from "@/components/exam/ielts-exam-toolbar";
import { IELTS_EXAM_VARS } from "@/components/exam/ielts-exam-theme";
import { bankExerciseToReadingQuestions } from "@/lib/bank-exercise-to-exam";
import type { BankExerciseStart } from "@/lib/practice-api";
import { ReadingPassagePanel } from "@/modules/reading/components/reading-passage-panel";
import { ReadingQuestionSection } from "@/modules/reading/components/reading-question-section";
import { groupReadingQuestions } from "@/modules/reading/lib/question-groups";
import type { QuestionSectionId } from "@/modules/reading/lib/reading-exam-flow";

type Props = {
  exercise: BankExerciseStart;
  hubHref: string;
  hubLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => void;
};

function asSectionId(id: string): QuestionSectionId {
  if (
    id === "tfng" ||
    id === "matching_headings" ||
    id === "sentence_completion"
  ) {
    return id;
  }
  if (
    id === "matching_information" ||
    id === "matching_features" ||
    id === "matching_sentence_endings" ||
    id === "matching"
  ) {
    return "matching_headings";
  }
  return "sentence_completion";
}

export function PracticeReadingExam({
  exercise,
  hubHref,
  hubLabel,
  busy,
  error,
  onSubmit,
}: Props) {
  const questions = useMemo(
    () => bankExerciseToReadingQuestions(exercise),
    [exercise],
  );
  const groups = useMemo(
    () => groupReadingQuestions(questions, exercise.part || 1),
    [questions, exercise.part],
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const passage =
    exercise.section.passage_text?.trim() ||
    exercise.section.instructions?.trim() ||
    "Reading passage";

  const answeredCount = questions.filter((q) =>
    (answers[q.id] ?? "").trim(),
  ).length;

  return (
    <div
      className="ielts-exam-theme fixed inset-0 z-40 flex flex-col overflow-hidden bg-[var(--reading-surface)] text-[var(--reading-ink)]"
      style={IELTS_EXAM_VARS}
    >
      <IeltsExamToolbar
        moduleName="Reading"
        stageLabel={`Passage ${exercise.part}`}
        testTitle={exercise.section.title?.trim() || "Reading practice"}
        hubHref={hubHref}
        hubLabel={hubLabel}
        remainingSeconds={20 * 60}
        timerActive={false}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        busy={busy}
        plainHeader
        onSubmit={() => onSubmit(answers)}
      />
      {error ? (
        <p
          className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-center text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-[38vh] max-h-[46vh] min-w-0 flex-col overflow-hidden border-b border-[var(--reading-border)] lg:max-h-none lg:min-h-0 lg:w-[56%] lg:flex-1 lg:border-b-0 lg:border-r">
          <ReadingPassagePanel passageText={passage} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-4 py-5 lg:w-[min(44%,560px)] lg:max-w-[560px] lg:shrink-0">
          {groups.map((group) => (
            <ReadingQuestionSection
              key={group.id}
              group={group}
              sectionId={asSectionId(group.id)}
              answers={answers}
              onAnswer={(id, value) =>
                setAnswers((prev) => ({ ...prev, [id]: value }))
              }
            />
          ))}
          {groups.length === 0 ? (
            <p className="text-sm text-[var(--reading-ink-muted)]">
              No questions in this set.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
