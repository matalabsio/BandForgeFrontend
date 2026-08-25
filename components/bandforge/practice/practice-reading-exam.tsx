"use client";

import { useCallback, useMemo, useState } from "react";
import { IeltsExamToolbar } from "@/components/exam/ielts-exam-toolbar";
import { IELTS_EXAM_VARS } from "@/components/exam/ielts-exam-theme";
import { bankExerciseToReadingQuestions } from "@/lib/bank-exercise-to-exam";
import type { BankExerciseStart } from "@/lib/practice-api";
import { ReadingAnswerSheet } from "@/modules/reading/components/reading-answer-sheet";
import {
  ReadingExamWorkspace,
  scrollToReadingQuestion,
  type ReadingWorkspaceTab,
} from "@/modules/reading/components/reading-exam-workspace";
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
  const [tab, setTab] = useState<ReadingWorkspaceTab>("passage");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null,
  );
  const passage =
    exercise.section.passage_text?.trim() ||
    exercise.section.instructions?.trim() ||
    "Reading passage";

  const answeredCount = questions.filter((q) =>
    (answers[q.id] ?? "").trim(),
  ).length;

  const answerSheetItems = useMemo(
    () =>
      questions.map((q) => ({
        id: q.id,
        number: q.display_number ?? q.question_number,
      })),
    [questions],
  );

  const handleJump = useCallback((id: string) => {
    setCurrentQuestionId(id);
    setTab("questions");
    scrollToReadingQuestion(id);
  }, []);

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
      <ReadingExamWorkspace
        tab={tab}
        onTabChange={setTab}
        tone="exam"
        passage={<ReadingPassagePanel passageText={passage} embedInScrollParent />}
        questionsHeader={
          questions.length > 0 ? (
            <ReadingAnswerSheet
              questions={answerSheetItems}
              answers={answers}
              currentQuestionId={currentQuestionId}
              onJump={handleJump}
              tone="exam"
            />
          ) : null
        }
        questions={
          <div className="space-y-8">
            {groups.map((group) => (
              <ReadingQuestionSection
                key={group.id}
                group={group}
                sectionId={asSectionId(group.id)}
                layout="stack"
                answers={answers}
                onAnswer={(id, value) => {
                  setCurrentQuestionId(id);
                  setAnswers((prev) => ({ ...prev, [id]: value }));
                }}
              />
            ))}
            {groups.length === 0 ? (
              <p className="px-4 py-5 text-sm text-[var(--reading-ink-muted)]">
                No questions in this set.
              </p>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
