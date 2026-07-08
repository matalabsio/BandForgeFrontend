"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import {
  DiagnosticExamShell,
  DiagnosticPassageText,
} from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
import { DIAGNOSTIC_READING_TIMER_SEC } from "@/lib/diagnostic-catalog";
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
import { ReadingQuestionInput } from "@/modules/reading/components/reading-question-input";
import { SentenceInlineBlank } from "@/modules/listening/components/listening-inline-answer";
import {
  splitPromptBlank,
} from "@/modules/reading/lib/reading-inline-blank";
import type { ReadingQuestion } from "@/modules/reading/types";
import { cn } from "@/lib/utils";

type Tab = "passage" | "questions";

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
  index,
  total,
}: {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
  index: number;
  total: number;
}) {
  const num = q.display_number ?? q.question_number;
  const type = q.question_type.toLowerCase();

  if (type === "sentence_completion") {
    const parts = splitPromptBlank(q.prompt);
    if (parts) {
      return (
        <li>
          <p className="mb-2.5 font-mono text-xs text-[#6E83A0]">
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
    <li>
      <p className="mb-2.5 font-mono text-xs text-[#6E83A0]">
        Question {index + 1} of {total}
      </p>
      <p className="mb-4 break-words text-[15.5px] leading-snug font-medium text-navy">
        {q.prompt}
      </p>
      <ReadingQuestionInput q={q} value={value} onChange={onChange} />
    </li>
  );
}

function PassageContent({ pack }: { pack: DiagnosticPack }) {
  return (
    <>
      <p className="mb-2 font-mono text-[11px] tracking-wider text-teal uppercase lg:mb-2.5">
        Passage 1
      </p>
      <h2 className="mb-4 break-words font-display text-lg font-bold tracking-tight text-navy sm:text-[19px] lg:mb-5 lg:text-[27px] lg:leading-tight">
        {pack.reading.title ?? "Reading Passage"}
      </h2>
      <DiagnosticPassageText text={pack.reading.passage} />
    </>
  );
}

function QuestionsContent({
  questions,
  questionCount,
  answers,
  onAnswer,
}: {
  questions: ReturnType<typeof packToReadingQuestions>;
  questionCount: number;
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
}) {
  return (
    <>
      <div className="mb-4 rounded-xl border border-cyan/20 bg-cyan/10 p-3.5 lg:mb-5">
        <p className="font-mono text-[11px] tracking-wide text-teal uppercase">
          Questions 1–{questionCount}
        </p>
        <p className="mt-1 text-[13.5px] leading-snug font-light text-[#3D4D63]">
          Answer all questions based on the passage.
        </p>
      </div>
      <ol className="space-y-6">
        {groupReadingBlocks(questions).map((block) => {
          if (block.kind === "matching_headings") {
            return (
              <DiagnosticReadingMatchingHeadings
                key="matching-headings"
                questions={block.questions}
                answers={answers}
                onAnswer={onAnswer}
              />
            );
          }
          return (
            <ReadingQuestionRow
              key={block.q.id}
              q={block.q}
              value={answers[block.q.id] ?? ""}
              onChange={(v) => onAnswer(block.q.id, v)}
              index={block.index}
              total={questions.length}
            />
          );
        })}
      </ol>
    </>
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
  const [tab, setTab] = useState<Tab>("passage");

  useEffect(() => {
    void loadDiagnosticPack()
      .then(setPack)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load diagnostic.");
      });
  }, []);

  const questions = pack ? packToReadingQuestions(pack) : [];
  const questionCount = pack?.reading.questions.length ?? 0;

  const handleAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      saveModuleAnswers("reading", next);
      return next;
    });
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
    ["--reading-border" as string]: "rgb(13 31 60 / 0.12)",
  };

  return (
    <DiagnosticModuleGuard module="reading">
      <DiagnosticChrome variant="exam" fillViewport>
        <DiagnosticExamShell
          module="reading"
          moduleIcon={BookOpen}
          error={error}
          loading={!pack}
          footerLabel="Submit reading"
          footerBusy={submitting}
          onFooter={handleSubmit}
          footerWidth="full"
          timer={
            <DiagnosticTimerPill
              durationSeconds={DIAGNOSTIC_READING_TIMER_SEC}
              onExpire={handleSubmit}
            />
          }
        >
          {pack ? (
            <div
              className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row"
              style={readingThemeVars}
            >
              {/* Mobile tabs */}
              <div className="flex shrink-0 gap-1.5 px-4 pt-3 sm:px-6 lg:hidden">
                {(["passage", "questions"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex-1 cursor-pointer py-2.5 text-center text-sm font-medium capitalize transition-colors",
                      tab === t
                        ? "rounded-t-[11px] border border-b-0 border-navy/10 bg-navy/[0.05] font-semibold text-navy"
                        : "text-[#6E83A0]",
                    )}
                  >
                    {t === "passage" ? "Passage" : "Questions"}
                  </button>
                ))}
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:contents">
              {/* Passage panel */}
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-navy/10 bg-navy/[0.03] px-6 py-[18px] lg:w-[60%] lg:flex-none lg:border-r lg:px-11 lg:py-8",
                  tab !== "passage" && "hidden lg:block",
                )}
              >
                <PassageContent pack={pack} />
              </div>

              {/* Questions panel */}
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-t border-navy/10 bg-navy/[0.03] px-6 py-[18px] lg:w-[40%] lg:flex-none lg:border-t-0 lg:px-8 lg:py-8",
                  tab !== "questions" && "hidden lg:block",
                )}
              >
                <QuestionsContent
                  questions={questions}
                  questionCount={questionCount}
                  answers={answers}
                  onAnswer={handleAnswer}
                />
              </div>
              </div>
            </div>
          ) : null}
        </DiagnosticExamShell>
      </DiagnosticChrome>
    </DiagnosticModuleGuard>
  );
}
