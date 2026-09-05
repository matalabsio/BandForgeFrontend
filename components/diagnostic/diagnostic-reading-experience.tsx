"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { DIAGNOSTIC_EXAM_STEPS, examStepIndex } from "@/components/diagnostic/diagnostic-exam-steps";
import { DiagnosticPassageText } from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticModuleFooter } from "@/components/diagnostic/diagnostic-module-footer";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
import { DiagnosticWaitState } from "@/components/diagnostic/ui/diagnostic-processing-loader";
import { DIAGNOSTIC_READING_TIMER_SEC } from "@/lib/diagnostic-catalog";
import { RichText } from "@/components/rich-text";
import {
  loadDiagnosticPack,
  packToReadingQuestions,
  type DiagnosticPack,
} from "@/lib/diagnostic-pack";
import { buildModuleReview, scoreReadingModule } from "@/lib/diagnostic-scoring";
import {
  advanceDiagnosticModule,
  readDiagnosticProgress,
  saveModuleAnswers,
} from "@/lib/diagnostic-storage";
import { diagnosticTransitionPath } from "@/lib/diagnostic-transitions";
import { DiagnosticReadingMatchingHeadings } from "@/components/diagnostic/diagnostic-reading-matching-headings";
import { ReadingAnswerSheet } from "@/modules/reading/components/reading-answer-sheet";
import {
  ReadingExamWorkspace,
  scrollToReadingQuestion,
  type ReadingWorkspaceTab,
} from "@/modules/reading/components/reading-exam-workspace";
import { ReadingQuestionInput } from "@/modules/reading/components/reading-question-input";
import { SentenceInlineBlank } from "@/modules/listening/components/listening-inline-answer";
import { splitPromptBlank } from "@/modules/reading/lib/reading-inline-blank";
import type { ReadingQuestion } from "@/modules/reading/types";
import { cn } from "@/lib/utils";

type ReadingQuestionBlock =
  | { kind: "single"; q: ReadingQuestion; index: number }
  | { kind: "matching_headings"; questions: ReadingQuestion[] };

function groupReadingBlocks(questions: ReadingQuestion[]): ReadingQuestionBlock[] {
  const blocks: ReadingQuestionBlock[] = [];
  let i = 0;
  while (i < questions.length) {
    const q = questions[i];
    if (q.question_type.toLowerCase() === "matching_headings") {
      const group: ReadingQuestion[] = [];
      while (
        i < questions.length &&
        questions[i].question_type.toLowerCase() === "matching_headings"
      ) {
        group.push(questions[i]);
        i += 1;
      }
      blocks.push({ kind: "matching_headings", questions: group });
    } else {
      blocks.push({ kind: "single", q, index: i });
      i += 1;
    }
  }
  return blocks;
}

function ReadingQuestionRow({
  q,
  value,
  onChange,
  onFocus,
  index,
  total,
  isCurrent,
}: {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  index: number;
  total: number;
  isCurrent: boolean;
}) {
  const num = q.display_number ?? q.question_number;
  const type = q.question_type.toLowerCase();
  const frameClass = cn(
    "scroll-mt-3 cursor-pointer rounded-[14px] border p-3 sm:p-4",
    isCurrent ? "border-cyan/40" : "border-transparent",
  );

  if (type === "sentence_completion") {
    const parts = splitPromptBlank(q.prompt);
    if (parts) {
      return (
        <li
          id={`reading-q-${q.id}`}
          className={frameClass}
          onClick={onFocus}
          onFocusCapture={onFocus}
        >
          <p className="mb-2.5 whitespace-nowrap font-mono text-xs text-[#6E83A0]">
            Question {index + 1} of {total}
          </p>
          <SentenceInlineBlank
            before={parts.before}
            after={parts.after}
            value={value}
            onChange={onChange}
            ariaLabel={`Question ${num}: ${q.prompt}`}
            variant="reading"
            questionNumber={num}
            showQuestionNumber
          />
        </li>
      );
    }
  }

  return (
    <li
      id={`reading-q-${q.id}`}
      className={frameClass}
      onClick={onFocus}
      onFocusCapture={onFocus}
    >
      <p className="mb-2.5 whitespace-nowrap font-mono text-xs text-[#6E83A0]">
        Question {index + 1} of {total}
      </p>
      <div className="mb-4 break-words text-[15.5px] leading-snug font-normal text-navy">
        <RichText text={q.prompt} />
      </div>
      <ReadingQuestionInput q={q} value={value} onChange={onChange} />
    </li>
  );
}

function PassageContent({ pack }: { pack: DiagnosticPack }) {
  const title = pack.reading.title ?? "Reading Passage";
  const passage = stripLeadingPassageTitle(pack.reading.passage, title);
  return (
    <div className="px-6 py-[18px] lg:px-11 lg:py-8">
      <p className="mb-2 font-mono text-[11px] tracking-wider text-teal uppercase lg:mb-2.5">
        Passage 1
      </p>
      <h2 className="mb-4 break-words font-display text-lg font-bold tracking-tight text-navy sm:text-[19px] lg:mb-5 lg:text-[27px] lg:leading-tight">
        {title}
      </h2>
      <DiagnosticPassageText text={passage} />
    </div>
  );
}

/** Pack passage often repeats the title as the first line — keep a single heading. */
function stripLeadingPassageTitle(passage: string, title: string): string {
  const trimmed = passage.trimStart();
  if (!title || !trimmed.startsWith(title)) return passage;
  return trimmed.slice(title.length).replace(/^\s*\n+/, "");
}

function QuestionsContent({
  questions,
  answers,
  currentQuestionId,
  onAnswer,
  onFocus,
}: {
  questions: ReturnType<typeof packToReadingQuestions>;
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onAnswer: (id: string, value: string) => void;
  onFocus: (id: string) => void;
}) {
  return (
    <ol className="space-y-6 px-6 py-[18px] lg:px-8 lg:py-8">
      {groupReadingBlocks(questions).map((block) => {
        if (block.kind === "matching_headings") {
          return (
            <DiagnosticReadingMatchingHeadings
              key="matching-headings"
              questions={block.questions}
              answers={answers}
              currentQuestionId={currentQuestionId}
              onAnswer={onAnswer}
              onFocus={onFocus}
            />
          );
        }
        return (
          <ReadingQuestionRow
            key={block.q.id}
            q={block.q}
            value={answers[block.q.id] ?? ""}
            onChange={(v) => onAnswer(block.q.id, v)}
            onFocus={() => onFocus(block.q.id)}
            index={block.index}
            total={questions.length}
            isCurrent={currentQuestionId === block.q.id}
          />
        );
      })}
    </ol>
  );
}

export function DiagnosticReadingExperience() {
  const router = useRouter();
  const [pack, setPack] = useState<DiagnosticPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => readDiagnosticProgress()?.answers.reading ?? {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<ReadingWorkspaceTab>("passage");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);

  useEffect(() => {
    void loadDiagnosticPack()
      .then(setPack)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load diagnostic.");
      });
  }, []);

  const questions = pack ? packToReadingQuestions(pack) : [];

  const answerSheetItems = useMemo(
    () =>
      questions.map((q) => ({
        id: q.id,
        number: q.display_number ?? q.question_number,
      })),
    [questions],
  );

  const handleAnswer = useCallback((id: string, value: string) => {
    setCurrentQuestionId(id);
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      saveModuleAnswers("reading", next);
      return next;
    });
  }, []);

  const handleJump = useCallback((id: string) => {
    setCurrentQuestionId(id);
    setTab("questions");
    scrollToReadingQuestion(id);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!pack || submitting) return;
    setSubmitting(true);
    const readingScore = scoreReadingModule(pack.reading.questions, answers);
    const readingReview = buildModuleReview(pack.reading.questions, answers);
    const progress = readDiagnosticProgress();
    advanceDiagnosticModule("reading", {
      moduleAnswers: { module: "reading", answers },
      scores: {
        listening_band: progress?.scores?.listening_band ?? null,
        reading_band: readingScore.band,
        writing_band: null,
        speaking_band: null,
        aggregate_band: null,
      },
      review: {
        listening: progress?.review?.listening,
        reading: readingReview,
      },
    });
    router.replace(diagnosticTransitionPath("reading-writing"));
  }, [pack, answers, submitting, router]);

  const readingThemeVars: CSSProperties = {
    ["--reading-ink" as string]: "#0D1F3C",
    ["--reading-ink-muted" as string]: "#5A6B82",
    ["--reading-accent" as string]: "#0097A7",
    ["--reading-accent-soft" as string]: "#E0F7FA",
    ["--reading-border" as string]: "rgb(13 31 60 / 0.12)",
    ["--reading-surface" as string]: "#F5F7FA",
    ["--reading-paper" as string]: "#FFFFFF",
  };

  const loading = !pack;

  return (
    <DiagnosticModuleGuard module="reading">
      <DiagnosticSplitShell
        steps={DIAGNOSTIC_EXAM_STEPS}
        currentStep={examStepIndex("reading")}
        heading="Reading"
        subtitle="Read the passage carefully, then answer the questions."
        fillViewport
        timer={
          <DiagnosticTimerPill
            durationSeconds={DIAGNOSTIC_READING_TIMER_SEC}
            onExpire={handleSubmit}
          />
        }
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          {error ? (
            <p className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          {loading ? (
            <DiagnosticWaitState />
          ) : (
            <>
              <div
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                style={readingThemeVars}
              >
                <ReadingExamWorkspace
                  tab={tab}
                  onTabChange={setTab}
                  tone="diagnostic"
                  passage={<PassageContent pack={pack} />}
                  questionsHeader={
                    <ReadingAnswerSheet
                      questions={answerSheetItems}
                      answers={answers}
                      currentQuestionId={currentQuestionId}
                      onJump={handleJump}
                      tone="diagnostic"
                    />
                  }
                  questions={
                    <QuestionsContent
                      questions={questions}
                      answers={answers}
                      currentQuestionId={currentQuestionId}
                      onAnswer={handleAnswer}
                      onFocus={setCurrentQuestionId}
                    />
                  }
                />
              </div>
              <DiagnosticModuleFooter
                label="Submit reading"
                busy={submitting}
                onClick={handleSubmit}
                contentWidth="narrow"
              />
            </>
          )}
        </div>
      </DiagnosticSplitShell>
    </DiagnosticModuleGuard>
  );
}
