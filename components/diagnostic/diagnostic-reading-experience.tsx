"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { DIAGNOSTIC_EXAM_STEPS, examStepIndex } from "@/components/diagnostic/diagnostic-exam-steps";
import { DiagnosticPassageText } from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticModuleFooter } from "@/components/diagnostic/diagnostic-module-footer";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
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
import { ReadingQuestionInput } from "@/modules/reading/components/reading-question-input";
import { SentenceInlineBlank } from "@/modules/listening/components/listening-inline-answer";
import { splitPromptBlank } from "@/modules/reading/lib/reading-inline-blank";
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
    <li
      id={`reading-q-${q.id}`}
      className={frameClass}
      onClick={onFocus}
      onFocusCapture={onFocus}
    >
      <p className="mb-2.5 font-mono text-xs text-[#6E83A0]">
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
    <>
      <p className="mb-2 font-mono text-[11px] tracking-wider text-teal uppercase lg:mb-2.5">
        Passage 1
      </p>
      <h2 className="mb-4 break-words font-display text-lg font-bold tracking-tight text-navy sm:text-[19px] lg:mb-5 lg:text-[27px] lg:leading-tight">
        {title}
      </h2>
      <DiagnosticPassageText text={passage} />
    </>
  );
}

/** Pack passage often repeats the title as the first line — keep a single heading. */
function stripLeadingPassageTitle(passage: string, title: string): string {
  const trimmed = passage.trimStart();
  if (!title || !trimmed.startsWith(title)) return passage;
  return trimmed.slice(title.length).replace(/^\s*\n+/, "");
}

function ReadingAnswerSheet({
  questions,
  answers,
  currentQuestionId,
  onJump,
}: {
  questions: ReturnType<typeof packToReadingQuestions>;
  answers: Record<string, string>;
  currentQuestionId: string | null;
  onJump: (id: string) => void;
}) {
  return (
    <div className="shrink-0 border-b border-navy/10 bg-white px-3 py-3 sm:px-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold tracking-[0.16em] text-cyan uppercase">
          Answer sheet
        </p>
        <p className="rounded-full bg-navy/[0.04] px-2.5 py-0.5 text-[11px] font-bold text-navy tabular-nums">
          1-{questions.length}
        </p>
      </div>
      <div
        className="mt-2.5 grid grid-cols-5 gap-1.5 sm:grid-cols-10"
        role="tablist"
        aria-label="Question navigation"
      >
        {questions.map((q) => {
          const answered = Boolean((answers[q.id] ?? "").trim());
          const isCurrent = currentQuestionId === q.id;
          const num = q.display_number ?? q.question_number;
          return (
            <button
              key={q.id}
              type="button"
              role="tab"
              onClick={() => onJump(q.id)}
              className={cn(
                "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center justify-self-center rounded-full border text-[12px] font-bold tabular-nums",
                isCurrent
                  ? "border-transparent bg-cyan text-white"
                  : answered
                    ? "border-cyan/50 bg-cyan/10 text-cyan"
                    : "border-navy/14 bg-white text-[#5A6B82] hover:border-navy/30",
              )}
              aria-label={`Question ${num}${answered ? ", answered" : ""}`}
              aria-selected={isCurrent}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
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
  const [tab, setTab] = useState<Tab>("passage");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);

  useEffect(() => {
    void loadDiagnosticPack()
      .then(setPack)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load diagnostic.");
      });
  }, []);

  const questions = pack ? packToReadingQuestions(pack) : [];

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
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`reading-q-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan border-t-transparent" role="status" aria-label="Loading" />
            </div>
          ) : (
            <>
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
                      "flex min-h-0 flex-1 flex-col overflow-hidden border-t border-navy/10 bg-navy/[0.03] lg:w-[40%] lg:flex-none lg:border-t-0",
                      tab !== "questions" && "hidden lg:flex",
                    )}
                  >
                    <ReadingAnswerSheet
                      questions={questions}
                      answers={answers}
                      currentQuestionId={currentQuestionId}
                      onJump={handleJump}
                    />
                    <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                      <QuestionsContent
                        questions={questions}
                        answers={answers}
                        currentQuestionId={currentQuestionId}
                        onAnswer={handleAnswer}
                        onFocus={setCurrentQuestionId}
                      />
                    </div>
                  </div>
                </div>
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
