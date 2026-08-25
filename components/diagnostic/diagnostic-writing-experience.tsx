"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { DIAGNOSTIC_EXAM_STEPS, examStepIndex } from "@/components/diagnostic/diagnostic-exam-steps";
import {
  DiagnosticExamColumn,
  DiagnosticExamScroll,
} from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticModuleFooter } from "@/components/diagnostic/diagnostic-module-footer";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
import { DiagnosticWaitState } from "@/components/diagnostic/ui/diagnostic-processing-loader";
import {
  DIAGNOSTIC_WRITING_TIMER_SEC,
  diagnosticPaths,
} from "@/lib/diagnostic-catalog";
import { loginPathWithNext } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  loadDiagnosticPack,
  type DiagnosticPack,
  type DiagnosticWritingTask,
} from "@/lib/diagnostic-pack";
import { startDiagnosticWritingEvaluation } from "@/lib/diagnostic-evaluate-writing";
import type { DiagnosticWritingEvaluation } from "@/lib/diagnostic-evaluate-writing";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import {
  SHORT_RESPONSE_AI_MIN_WORDS,
  shortResponseBand,
  wordCount,
} from "@/lib/diagnostic-scoring";
import {
  advanceDiagnosticModule,
  readDiagnosticProgress,
  saveModuleAnswers,
} from "@/lib/diagnostic-storage";
import { diagnosticTransitionPath } from "@/lib/diagnostic-transitions";
import { ApiError } from "@/lib/api";
import { examTextInputProps } from "@/lib/exam-input-props";

type WritingPanel = "task1" | "task2";
const WRITING_ZERO_BAND_MAX_WORDS = 49;

function buildShortWritingEvaluation(
  words: number,
): DiagnosticWritingEvaluation {
  const noResponse = words <= 0;
  const veryShort = words > 0 && words <= WRITING_ZERO_BAND_MAX_WORDS;
  const band = veryShort ? 0 : shortResponseBand(words);
  return {
    evaluation_id: `short-local-${Date.now()}`,
    writing_band: band,
    scores: {
      task_achievement: band,
      coherence: band,
      lexical_resource: band,
      grammar: band,
    },
    feedback: {
      strengths: [],
      weaknesses: noResponse
        ? ["No response collected."]
        : veryShort
          ? ["Response too short (under 50 words)."]
          : ["Response too short for a full IELTS Writing evaluation."],
      improvement_tips: [
        noResponse || veryShort
          ? "Write at least 50 words to receive a non-zero Writing score."
          : "Write at least 100 words to unlock AI criterion scoring.",
      ],
    },
    metadata: {
      word_count: words,
      sentence_count: 0,
      paragraph_count: 0,
    },
    warnings: noResponse
      ? ["No response collected — Writing score set to 0."]
      : veryShort
        ? ["Under 50 words — Writing score set to 0."]
        : ["Too short for full IELTS evaluation — write 100+ words for AI scoring."],
    provider: "short_local",
  };
}

type PromptBlocks = {
  intro: string;
  description: string;
  instruction: string;
  minWordsLine: string;
};

function splitPromptBlocks(prompt: string): PromptBlocks | null {
  const text = prompt.replace(/\s+/g, " ").trim();
  if (!text) return null;

  const introMatch = text.match(/You should spend about .*? on this task\./i);
  const instructionMatch = text.match(
    /(Summarise|Summarize) .*? relevant\./i,
  );
  const minWordsMatch = text.match(/Write at least \d+\s*\+?\s*words\.?/i);

  const intro = introMatch?.[0]?.trim() ?? "";
  const instruction = instructionMatch?.[0]?.trim() ?? "";
  const minWordsLine = minWordsMatch?.[0]?.trim() ?? "";

  if (!intro && !instruction && !minWordsLine) return null;

  let description = text;
  if (intro) description = description.replace(intro, "").trim();
  if (instruction) description = description.replace(instruction, "").trim();
  if (minWordsLine) description = description.replace(minWordsLine, "").trim();
  description = description.replace(/\s+/g, " ").trim();

  return { intro, description, instruction, minWordsLine };
}

function taskPanelId(task: DiagnosticWritingTask): WritingPanel {
  return task.part === 1 ? "task1" : "task2";
}

export function DiagnosticWritingExperience() {
  const router = useRouter();
  const [pack, setPack] = useState<DiagnosticPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [essays, setEssays] = useState<Record<string, string>>({});
  const [activePanel, setActivePanel] = useState<WritingPanel>("task1");
  const [submitting, setSubmitting] = useState(false);

  const tasks = pack?.writing.tasks ?? [];
  const activeTask =
    tasks.find((t) => taskPanelId(t) === activePanel) ?? tasks[0] ?? null;

  useEffect(() => {
    const progress = readDiagnosticProgress();
    if (progress?.answers.writing) {
      setEssays(progress.answers.writing);
    }
    void loadDiagnosticPack()
      .then(setPack)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load diagnostic.");
      });
  }, []);

  const words = useMemo(
    () => (activeTask ? wordCount(essays[activeTask.id] ?? "") : 0),
    [activeTask, essays],
  );
  const promptBlocks = useMemo(
    () => (activeTask ? splitPromptBlocks(activeTask.prompt) : null),
    [activeTask],
  );

  const persistEssays = useCallback((next: Record<string, string>) => {
    setEssays(next);
    saveModuleAnswers("writing", next);
  }, []);

  const handleEssayChange = useCallback(
    (taskId: string, value: string) => {
      persistEssays({ ...essays, [taskId]: value });
    },
    [essays, persistEssays],
  );

  const handleSubmit = useCallback(async () => {
    if (!pack || submitting || !activeTask) return;
    setSubmitting(true);
    setError(null);

    const progress = readDiagnosticProgress();
    if (!progress) {
      setError("Diagnostic session expired. Please start again.");
      setSubmitting(false);
      return;
    }

    const primaryTask = tasks[0] ?? activeTask;
    const essayText = essays[primaryTask.id] ?? "";
    const words = wordCount(essayText);

    if (words < SHORT_RESPONSE_AI_MIN_WORDS) {
      const shortEval = buildShortWritingEvaluation(words);
      advanceDiagnosticModule("writing", {
        moduleAnswers: { module: "writing", answers: essays },
        scores: {
          listening_band: progress?.scores?.listening_band ?? null,
          reading_band: progress?.scores?.reading_band ?? null,
          writing_band: shortEval.writing_band,
          speaking_band: null,
          aggregate_band: null,
        },
        review: progress?.review,
        writingEvaluation: shortEval,
        writingEvalPending: false,
      });
      router.replace(diagnosticTransitionPath("writing-speaking"));
      return;
    }

    try {
      const blocks = splitPromptBlocks(primaryTask.prompt);
      const visualDescription =
        primaryTask.part === 1
          ? (
              primaryTask.visualDescription?.trim() ||
              blocks?.description?.trim() ||
              ""
            )
          : "";
      const lead = readDiagnosticLead();
      const started = await startDiagnosticWritingEvaluation({
        client_attempt_id: progress.attemptId,
        task_part: primaryTask.part,
        question: primaryTask.prompt,
        essay: essayText,
        visual_description: visualDescription || undefined,
        target_band: lead?.targetBand ?? null,
      });

      if (started.status === "complete") {
        advanceDiagnosticModule("writing", {
          moduleAnswers: { module: "writing", answers: essays },
          scores: {
            listening_band: progress?.scores?.listening_band ?? null,
            reading_band: progress?.scores?.reading_band ?? null,
            writing_band: started.evaluation.writing_band,
            speaking_band: null,
            aggregate_band: null,
          },
          review: progress?.review,
          writingEvaluation: started.evaluation,
          writingEvalPending: false,
        });
      } else {
        advanceDiagnosticModule("writing", {
          moduleAnswers: { module: "writing", answers: essays },
          scores: {
            listening_band: progress?.scores?.listening_band ?? null,
            reading_band: progress?.scores?.reading_band ?? null,
            writing_band: null,
            speaking_band: null,
            aggregate_band: null,
          },
          review: progress?.review,
          writingEvalPending: true,
          writingEvalEssayHash: started.essayHash,
        });
      }
      router.replace(diagnosticTransitionPath("writing-speaking"));
    } catch (e: unknown) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        router.replace(loginPathWithNext(diagnosticPaths.writing));
        return;
      }
      if (e instanceof ApiError && e.status === 429) {
        setError("Too many evaluations. Please wait an hour and try again.");
      } else if (e instanceof ApiError && e.status === 503) {
        setError("AI evaluation is temporarily unavailable. Please try again in a moment.");
      } else if (e instanceof ApiError && e.status === 400) {
        setError(
          e.message.includes("too short")
            ? "Response too short for IELTS evaluation. Write at least 100 words of your own answer (150+ recommended)."
            : e.message,
        );
      } else {
        setError(
          e instanceof Error
            ? e.message
            : "Could not evaluate your essay. Please try again.",
        );
      }
      setSubmitting(false);
    }
  }, [pack, essays, submitting, router, tasks, activeTask]);

  const loading = !pack;

  return (
    <DiagnosticModuleGuard module="writing">
      <DiagnosticSplitShell
        steps={DIAGNOSTIC_EXAM_STEPS}
        currentStep={examStepIndex("writing")}
        heading="Writing"
        subtitle="Read the task carefully and write your response."
        fillViewport
        timer={
          <DiagnosticTimerPill
            durationSeconds={DIAGNOSTIC_WRITING_TIMER_SEC}
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
          ) : activeTask ? (
            <>
              <DiagnosticExamScroll>
                <DiagnosticExamColumn className="flex min-h-0 flex-col">
                  {tasks.length > 1 ? (
                    <div className="-mx-2 flex shrink-0 gap-2 overflow-x-auto px-2 pt-3.5">
                      {tasks.map((task) => {
                        const panel = taskPanelId(task);
                        return (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => setActivePanel(panel)}
                            className={cn(
                              "cursor-pointer rounded-[10px] px-4 py-2 text-[13.5px] font-medium transition-colors",
                              activePanel === panel
                                ? "border border-cyan/30 bg-cyan/14 font-semibold text-navy"
                                : "border border-navy/14 text-[#6E83A0]",
                            )}
                          >
                            Task {task.part}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="min-h-0 flex-1 py-4">
                    <div className="mb-3 max-w-full rounded-[14px] border border-navy/10 bg-navy/[0.04] p-4">
                      <p className="font-mono text-[10px] tracking-wider text-teal uppercase">
                        Task {activeTask.part}
                      </p>
                      {promptBlocks ? (
                        <div className="mt-2.5 space-y-2.5">
                          {promptBlocks.description ? (
                            <p className="break-words text-sm leading-relaxed font-light text-[#334155]">
                              {promptBlocks.description}
                            </p>
                          ) : null}
                          {promptBlocks.instruction ? (
                            <p className="break-words text-sm leading-relaxed font-medium text-[#1B2B45]">
                              {promptBlocks.instruction}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-2 break-words text-sm leading-relaxed font-light text-[#1B2B45]">
                          {activeTask.prompt}
                        </p>
                      )}
                    </div>

                    {activeTask.diagramUrl ? (
                      <div className="mb-4 overflow-hidden rounded-[14px] border border-dashed border-navy/18 bg-[repeating-linear-gradient(45deg,rgba(13,31,60,0.05)_0_10px,transparent_10px_20px)] p-3 md:p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeTask.diagramUrl}
                          alt="Task diagram"
                          className="mx-auto h-auto max-h-[420px] w-full max-w-4xl object-contain"
                        />
                      </div>
                    ) : null}

                    <textarea
                      id={`diagnostic-writing-${activeTask.id}`}
                      value={essays[activeTask.id] ?? ""}
                      onChange={(e) => handleEssayChange(activeTask.id, e.target.value)}
                      {...examTextInputProps}
                      className="min-h-[280px] w-full max-w-full resize-y rounded-[14px] border border-navy/10 bg-white p-4 text-sm leading-relaxed text-navy outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                      placeholder="Write your response here…"
                    />
                    <p className="mt-3 text-right font-mono text-xs text-[#6E83A0]">
                      Current words: {words}
                    </p>
                  </div>
                </DiagnosticExamColumn>
              </DiagnosticExamScroll>
              <DiagnosticModuleFooter
                label="Continue to speaking"
                busy={submitting}
                busyLabel="Submitting…"
                onClick={handleSubmit}
                contentWidth="narrow"
              />
            </>
          ) : null}
        </div>
      </DiagnosticSplitShell>
    </DiagnosticModuleGuard>
  );
}
