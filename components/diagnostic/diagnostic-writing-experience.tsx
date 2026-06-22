"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { DiagnosticExamShell } from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
import { DIAGNOSTIC_WRITING_TIMER_SEC } from "@/lib/diagnostic-catalog";
import {
  loadDiagnosticPack,
  type DiagnosticPack,
  type DiagnosticWritingTask,
} from "@/lib/diagnostic-pack";
import { scoreWritingTasks, wordCount } from "@/lib/diagnostic-scoring";
import {
  advanceDiagnosticModule,
  readDiagnosticProgress,
  saveModuleAnswers,
} from "@/lib/diagnostic-storage";
import { diagnosticTransitionPath } from "@/lib/diagnostic-transitions";
import { cn } from "@/lib/utils";

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

  const handleSubmit = useCallback(() => {
    if (!pack || submitting) return;
    const hasContent = tasks.some((t) => (essays[t.id] ?? "").trim().length > 0);
    if (!hasContent) {
      setError("Please write at least one task response before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const writingScore = scoreWritingTasks(
      essays,
      tasks.map((t) => ({ id: t.id, part: t.part, minWords: t.minWords })),
    );
    const progress = readDiagnosticProgress();

    advanceDiagnosticModule("writing", {
      moduleAnswers: { module: "writing", answers: essays },
      scores: {
        listening_band: progress?.scores?.listening_band ?? null,
        reading_band: progress?.scores?.reading_band ?? null,
        writing_band: writingScore.band,
        speaking_band: null,
        aggregate_band: null,
      },
      review: progress?.review,
    });
    router.replace(diagnosticTransitionPath("writing-speaking"));
  }, [pack, essays, submitting, router, tasks]);

  return (
    <DiagnosticModuleGuard module="writing">
      <DiagnosticChrome variant="exam" fillViewport>
        <DiagnosticExamShell
          module="writing"
          moduleIcon={Pencil}
          error={error}
          loading={!pack}
          footerLabel="Submit writing"
          footerBusy={submitting}
          onFooter={handleSubmit}
          timer={
            <DiagnosticTimerPill
              durationSeconds={DIAGNOSTIC_WRITING_TIMER_SEC}
              onExpire={handleSubmit}
            />
          }
        >
          {pack && activeTask ? (
            <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden px-4 sm:px-6">
              <div className="flex shrink-0 gap-2 pt-3.5">
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

              <div className="min-h-0 flex-1 overflow-y-auto py-4">
                <div className="mb-3 rounded-[14px] border border-navy/10 bg-navy/[0.04] p-4">
                  <p className="font-mono text-[10px] tracking-wider text-teal uppercase">
                    Task {activeTask.part} · {activeTask.part === 1 ? "20" : "25"} min ·{" "}
                    {activeTask.minWords}+ words
                  </p>
                  <p className="mt-2 text-sm leading-relaxed font-light text-[#1B2B45]">
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
                  className="min-h-[280px] w-full resize-y rounded-[14px] border border-navy/10 bg-white p-4 text-sm leading-relaxed text-navy outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                  placeholder="Write your response here…"
                />
                <p
                  className={cn(
                    "mt-2 text-right font-mono text-xs",
                    words >= activeTask.minWords ? "text-teal" : "text-[#6E83A0]",
                  )}
                >
                  {words} words
                </p>
              </div>
            </div>
          ) : null}
        </DiagnosticExamShell>
      </DiagnosticChrome>
    </DiagnosticModuleGuard>
  );
}
