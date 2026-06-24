"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { DiagnosticExamShell, DiagnosticExamScroll, DiagnosticExamColumn } from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
import { DIAGNOSTIC_WRITING_TIMER_SEC } from "@/lib/diagnostic-catalog";
import {
  loadDiagnosticPack,
  type DiagnosticPack,
  type DiagnosticWritingTask,
} from "@/lib/diagnostic-pack";
import { evaluateDiagnosticWriting } from "@/lib/diagnostic-evaluate-writing";
import { wordCount } from "@/lib/diagnostic-scoring";
import {
  advanceDiagnosticModule,
  readDiagnosticProgress,
  saveModuleAnswers,
} from "@/lib/diagnostic-storage";
import { diagnosticTransitionPath } from "@/lib/diagnostic-transitions";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";

type WritingPanel = "task1" | "task2";

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
    const hasContent = tasks.some((t) => (essays[t.id] ?? "").trim().length > 0);
    if (!hasContent) {
      setError("Please write at least one task response before submitting.");
      return;
    }
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

    try {
      const writingEvaluation = await evaluateDiagnosticWriting({
        client_attempt_id: progress.attemptId,
        task_part: primaryTask.part,
        question: primaryTask.prompt,
        essay: essayText,
      });

      advanceDiagnosticModule("writing", {
        moduleAnswers: { module: "writing", answers: essays },
        scores: {
          listening_band: progress?.scores?.listening_band ?? null,
          reading_band: progress?.scores?.reading_band ?? null,
          writing_band: writingEvaluation.writing_band,
          speaking_band: null,
          aggregate_band: null,
        },
        review: progress?.review,
        writingEvaluation,
      });
      router.replace(diagnosticTransitionPath("writing-speaking"));
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 429) {
        setError("Too many evaluations. Please wait an hour and try again.");
      } else if (e instanceof ApiError && e.status === 503) {
        setError("AI evaluation is temporarily unavailable. Please try again in a moment.");
      } else if (e instanceof ApiError && e.status === 400) {
        setError(
          e.message.includes("too short")
            ? "Response too short for IELTS evaluation. Write at least 30 words of your own answer (150+ recommended)."
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

  return (
    <DiagnosticModuleGuard module="writing">
      <DiagnosticChrome variant="exam" fillViewport>
        <DiagnosticExamShell
          module="writing"
          moduleIcon={Pencil}
          error={error}
          loading={!pack}
          footerLabel="Continue to speaking"
          footerBusy={submitting}
          footerBusyLabel="Evaluating your essay…"
          onFooter={handleSubmit}
          footerWidth="full"
          timer={
            <DiagnosticTimerPill
              durationSeconds={DIAGNOSTIC_WRITING_TIMER_SEC}
              onExpire={handleSubmit}
            />
          }
        >
          {pack && activeTask ? (
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
                    Task {activeTask.part} · {activeTask.part === 1 ? "20" : "25"} min ·{" "}
                    {activeTask.minWords}+ words
                  </p>
                  <p className="mt-2 break-words text-sm leading-relaxed font-light text-[#1B2B45]">
                    {activeTask.prompt}
                  </p>
                </div>

                {activeTask.diagramUrl ? (
                  <div className="mb-4 overflow-hidden rounded-[14px] border border-dashed border-navy/18 bg-[repeating-linear-gradient(45deg,rgba(13,31,60,0.05)_0_10px,transparent_10px_20px)] p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeTask.diagramUrl}
                      alt="Task diagram"
                      className="mx-auto h-auto max-h-40 w-full max-w-md object-contain"
                    />
                  </div>
                ) : null}

                <textarea
                  id={`diagnostic-writing-${activeTask.id}`}
                  value={essays[activeTask.id] ?? ""}
                  onChange={(e) => handleEssayChange(activeTask.id, e.target.value)}
                  className="min-h-[280px] w-full max-w-full resize-y rounded-[14px] border border-navy/10 bg-white p-4 text-sm leading-relaxed text-navy outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                  placeholder="Write your response here…"
                />
                <div className="mt-3 space-y-2">
                  <p
                    className={cn(
                      "text-right font-mono text-xs",
                      words >= activeTask.minWords ? "text-teal" : "text-[#6E83A0]",
                    )}
                  >
                    Current words: {words}
                  </p>
                  {words < activeTask.minWords ? (
                    <div
                      className="rounded-[12px] border border-amber-200/80 bg-[#FEF8EC] px-3.5 py-3 text-[13px] leading-snug font-light text-[#5C4A2E]"
                      role="status"
                    >
                      <p className="font-medium text-[#8A5A00]">
                        IELTS Task {activeTask.part} requires at least {activeTask.minWords} words.
                      </p>
                      <p className="mt-1">
                        Your score may be significantly reduced. Write an overview, key features,
                        and comparisons before continuing.
                      </p>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="mt-6 flex min-h-[var(--spacing-touch,48px)] w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-cyan px-6 font-display text-base font-semibold text-[#06222B] shadow-[0_12px_28px_rgba(0,188,212,0.30)] transition-colors hover:bg-brand-sky-hover disabled:cursor-not-allowed disabled:opacity-60 lg:hidden"
                >
                  {submitting ? "Evaluating your essay…" : "Continue to speaking"}
                  {!submitting ? <ArrowRight className="size-4" aria-hidden /> : null}
                </button>
              </div>
              </DiagnosticExamColumn>
            </DiagnosticExamScroll>
          ) : null}
        </DiagnosticExamShell>
      </DiagnosticChrome>
    </DiagnosticModuleGuard>
  );
}
