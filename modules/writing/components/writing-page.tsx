"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_MOCK_SLUG,
  mockAfterWritingSubmitPath,
  mockModulePath,
  mockPathFromProgress,
  mockHubPath,
  TEST1_WRITING_TASK_COUNT,
} from "@/lib/mock-catalog";
import { cacheMockNavHint, shouldSkipMockGuard } from "@/lib/mock-nav-cache";
import { redirectIfMockCompleted } from "@/lib/mock-completed-nav";
import type { WritingBootServer } from "@/lib/mock-server";
import { fetchMockProgressDeduped } from "@/modules/mock/lib/mock-progress-fetch";
import { syncExamRoute } from "@/lib/mock-exam-nav";
import { writingApi } from "@/modules/writing/services/writing-api";
import type { WritingTask } from "@/modules/writing/types";
import {
  estimateWritingBand,
  writingMinWords,
  writingResultsPath,
} from "@/lib/writing-test";
import { WritingTask1Prompt } from "@/modules/writing/components/writing-task1-prompt";
import { WritingTask2Prompt } from "@/modules/writing/components/writing-task2-prompt";
import { TestHeader, TestShell, TestTimer, WordCounter } from "@/modules/shared";
import { useExamSessionRefresh } from "@/modules/shared/hooks/use-exam-session-refresh";
import { cn } from "@/lib/utils";
import { SectionInstructionsModal } from "@/modules/shared/components/section-instructions-modal";
import {
  ExamBusyOverlay,
  ExamSectionLoader,
} from "@/modules/shared/components/exam-section-loader";

function readConsent(moduleKey: string, attemptScope: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`bf-instructions:${moduleKey}:${attemptScope}`) === "1";
  } catch {
    return false;
  }
}

function writeConsent(moduleKey: string, attemptScope: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`bf-instructions:${moduleKey}:${attemptScope}`, "1");
  } catch {
    /* ignore */
  }
}

const STORAGE_PREFIX = "bf-writing-";

function storageKey(attemptId: string): string {
  return `${STORAGE_PREFIX}${attemptId}`;
}

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

type Props = {
  mockTestId: string;
  part: 1 | 2;
  mockSlug?: string;
  autoStart?: boolean;
  initialBoot?: WritingBootServer | null;
};

export function WritingPage({
  mockTestId,
  part,
  mockSlug = DEFAULT_MOCK_SLUG,
  autoStart = true,
  initialBoot = null,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mockAttemptId = searchParams.get("mock_attempt");
  const sectionStart = searchParams.get("section_start") === "1";

  const [phase, setPhase] = useState<"loading" | "intro" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [task, setTask] = useState<WritingTask | null>(null);
  const [essay, setEssay] = useState("");
  const [saved, setSaved] = useState(true);
  const [introAgreed, setIntroAgreed] = useState(false);
  const [introPassed, setIntroPassed] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(
    part === 1 ? 20 * 60 : 40 * 60,
  );
  const [remaining, setRemaining] = useState(durationSeconds);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveBlockedRef = useRef(false);
  const bootedRef = useRef(false);
  const needsConsentGateRef = useRef(false);

  const minWords =
    task?.options?.min_words ?? writingMinWords(part);
  const activePart = (task?.part === 1 || task?.part === 2) ? task.part : part;

  const wordCount = useMemo(() => countWords(essay), [essay]);
  const estimatedBand = useMemo(
    () => estimateWritingBand(wordCount, part),
    [wordCount, part],
  );
  const needsConsentGate = part === 1 && !introPassed;
  const instructionScope = useMemo(
    () => mockAttemptId ?? `${mockTestId}:writing`,
    [mockAttemptId, mockTestId],
  );

  useEffect(() => {
    needsConsentGateRef.current = needsConsentGate;
  }, [needsConsentGate]);

  useEffect(() => {
    if (part !== 1) {
      setIntroAgreed(true);
      setIntroPassed(true);
      return;
    }
    const seen = readConsent("writing", instructionScope);
    setIntroAgreed(seen);
    setIntroPassed(false);
  }, [part, instructionScope]);

  // Client navigation part=1 → part=2 reuses this component; reset so Task 2 gets a new attempt.
  useEffect(() => {
    bootedRef.current = false;
    autosaveBlockedRef.current = false;
    if (autosaveRef.current) {
      clearTimeout(autosaveRef.current);
      autosaveRef.current = null;
    }
    setAttemptId(null);
    setTask(null);
    setEssay("");
    setError(null);
    setBusy(false);
    setSaved(true);
    setPhase("loading");
  }, [part, mockTestId, mockAttemptId]);

  useEffect(() => {
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (phase !== "ready") return;
    const id = window.setInterval(() => {
      setRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useExamSessionRefresh(phase === "ready" && Boolean(attemptId));

  const beginSession = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await writingApi.start(mockTestId, {
        part,
        mockAttemptId: mockAttemptId ?? undefined,
        forceNew: false,
      });
      setAttemptId(res.attempt_id);
      setTask(res.task ?? null);
      setDurationSeconds(res.duration_seconds);
      setRemaining(res.duration_seconds);
      const initial =
        res.saved_answer?.trim() ||
        (typeof window !== "undefined"
          ? localStorage.getItem(storageKey(res.attempt_id)) ?? ""
          : "");
      setEssay(initial);
      setSaved(true);
      autosaveBlockedRef.current = false;
      setPhase("ready");
    } catch (e) {
      if (e instanceof ApiError && mockAttemptId && (e.status === 403 || e.status === 409)) {
        try {
          const progress = await fetchMockProgressDeduped(mockAttemptId);
          router.replace(mockPathFromProgress(mockSlug, mockAttemptId, progress));
          return;
        } catch {
          router.replace(mockHubPath(mockSlug));
          return;
        }
      }
      setError(e instanceof Error ? e.message : "Could not start writing task.");
      setPhase("error");
    }
  }, [mockTestId, part, mockAttemptId, mockSlug, router]);

  useEffect(() => {
    if (initialBoot?.task) {
      if (bootedRef.current) return;
      if (part === 1 && !introPassed) {
        setPhase("intro");
        return;
      }
      bootedRef.current = true;
      setAttemptId(initialBoot.attempt_id);
      setTask(initialBoot.task as WritingTask);
      setDurationSeconds(initialBoot.duration_seconds);
      setRemaining(initialBoot.duration_seconds);
      const initial =
        initialBoot.saved_answer?.trim() ||
        (typeof window !== "undefined"
          ? localStorage.getItem(storageKey(initialBoot.attempt_id)) ?? ""
          : "");
      setEssay(initial);
      setSaved(true);
      autosaveBlockedRef.current = false;
      setPhase("ready");
      return;
    }
    if (!autoStart) {
      setPhase("loading");
      return;
    }
    if (part === 1 && !introPassed) {
      setPhase("intro");
      return;
    }
    if (bootedRef.current) return;
    bootedRef.current = true;
    void beginSession();
  }, [autoStart, beginSession, initialBoot, mockAttemptId, part, introPassed]);

  useEffect(() => {
    if (needsConsentGateRef.current) return;
    if (!mockAttemptId) return;
    if (shouldSkipMockGuard(mockAttemptId, sectionStart)) return;
    let cancelled = false;
    void (async () => {
      try {
        const p = await fetchMockProgressDeduped(mockAttemptId);
        if (cancelled) return;
        if (redirectIfMockCompleted(p.status, router.replace.bind(router))) {
          return;
        }
        const writingMod = p.modules.find((m) => m.module === "writing");
        if (
          writingMod?.status === "completed" &&
          writingMod.test_attempt_id
        ) {
          const q = new URLSearchParams({ mock_attempt: mockAttemptId });
          router.replace(
            `${writingResultsPath(writingMod.test_attempt_id)}?${q.toString()}`,
          );
          return;
        }
        syncExamRoute(
          { replace: router.replace.bind(router) },
          mockSlug,
          mockAttemptId,
          { module: "writing", part },
          p,
        );
      } catch {
        if (!cancelled) router.replace(mockHubPath(mockSlug));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mockAttemptId, mockSlug, part, sectionStart, router]);

  useEffect(() => {
    return () => {
      autosaveBlockedRef.current = true;
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
        autosaveRef.current = null;
      }
    };
  }, []);

  const handleChange = (value: string) => {
    setEssay(value);
    if (attemptId) {
      try {
        localStorage.setItem(storageKey(attemptId), value);
      } catch {
        /* ignore */
      }
    }
  };

  const submitTask = async () => {
    if (!attemptId || !task || busy) return;
    if (task.part !== part) {
      setError(null);
      bootedRef.current = false;
      void beginSession();
      return;
    }
    const trimmed = essay.trim();
    if (!trimmed) {
      setError("Please write your response before submitting.");
      return;
    }
    setBusy(true);
    setError(null);
    autosaveBlockedRef.current = true;
    try {
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
        autosaveRef.current = null;
      }
      const result = await writingApi.submit(attemptId, [
        { question_id: task.id, user_answer: trimmed },
      ]);
      try {
        localStorage.removeItem(storageKey(attemptId));
      } catch {
        /* ignore */
      }

      if (mockAttemptId) {
        cacheMockNavHint({
          mock_attempt_id: mockAttemptId,
          next_module: result.mock_writing_complete ? null : "writing",
          next_part: result.mock_writing_complete
            ? null
            : result.mock_next_part ?? part + 1,
        });
        if (
          result.mock_writing_complete ||
          result.mock_next_module === "speaking"
        ) {
          router.replace(
            `/mock/${mockSlug}/results?mock_attempt=${encodeURIComponent(mockAttemptId)}`,
          );
          return;
        }
        if (result.next_part === 2 && part === 1 && TEST1_WRITING_TASK_COUNT > 1) {
          bootedRef.current = false;
          router.push(
            mockModulePath(mockSlug, "writing", {
              part: 2,
              mockAttemptId,
              auto: true,
            }) + "&section_start=1",
          );
          return;
        }
        router.push(
          mockAfterWritingSubmitPath(
            mockSlug,
            mockAttemptId,
            part,
            {
              status: result.mock_writing_complete ? "completed" : undefined,
              next_module: result.mock_next_module,
              next_part: result.mock_next_part,
            },
            result.attempt_id,
          ),
        );
        return;
      }

      if (result.next_part === 2 && part === 1 && TEST1_WRITING_TASK_COUNT > 1) {
        router.push(`/test/writing/task/2?auto=1`);
        return;
      }

      const q = mockAttemptId
        ? `?mock_attempt=${encodeURIComponent(mockAttemptId)}`
        : "";
      router.push(`${writingResultsPath(result.attempt_id)}${q}`);
    } catch (e) {
      autosaveBlockedRef.current = false;
      setError(e instanceof Error ? e.message : "Submit failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleWritingIntroContinue = () => {
    if (part !== 1 || !introAgreed) return;
    writeConsent("writing", instructionScope);
    setIntroPassed(true);
    if (bootedRef.current) return;
    bootedRef.current = true;
    void beginSession();
  };

  if (phase === "loading") {
    return (
      <TestShell header={<TestHeader timer={<span className="text-meta">Loading…</span>} />}>
        <ExamSectionLoader
          className="min-h-0"
          title={`Loading Writing · Task ${part}`}
          subtitle="Fetching your task prompt and starting the timer."
        />
      </TestShell>
    );
  }

  if (phase === "error") {
    return (
      <TestShell header={<TestHeader timer={null} />}>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <p className="text-[14px] text-red-600" role="alert">
            {error}
          </p>
          <Button variant="primary" onClick={() => void beginSession()}>
            Retry
          </Button>
        </main>
      </TestShell>
    );
  }

  if (phase === "intro" && part === 1) {
    return (
      <SectionInstructionsModal
        title="Writing Test Instructions"
        description="You will complete two writing tasks in order: Task 1, then Task 2."
        instructions={[
          "Task 1 and Task 2 are timed separately and must be completed in order.",
          "Your draft is kept in this browser while you type.",
          "Submit Task 1 to continue to Task 2.",
          "Submit Task 2 to finish the writing module.",
          "Aim to meet the minimum word count for each task before submission.",
        ]}
        ctaLabel="Begin Writing"
        agreed={introAgreed}
        onAgreeChange={setIntroAgreed}
        onContinue={handleWritingIntroContinue}
      />
    );
  }

  return (
    <TestShell
      header={<TestHeader timer={<TestTimer remainingSeconds={remaining} />} />}
    >
      {busy ? (
        <ExamBusyOverlay
          title={
            activePart === 1
              ? "Submitting Task 1…"
              : "Submitting Writing…"
          }
          subtitle={
            activePart === 1
              ? "Saving your response and loading Task 2."
              : "Saving your response and opening your results."
          }
        />
      ) : null}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--reading-border)] bg-[var(--reading-bar)]/5 px-4 py-3 md:px-6">
          <p className="text-meta font-semibold text-[var(--reading-ink)]">
            Writing Task {activePart}
            {mockAttemptId ? " · Full mock" : ""}
          </p>
          <div className="flex items-center gap-4">
            <WordCounter count={wordCount} min={minWords} />
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-meta font-semibold tabular-nums",
                wordCount >= minWords
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-[var(--reading-surface)] text-[var(--reading-ink-muted)]",
              )}
              title={`Estimated band from word count (minimum ${minWords} words)`}
            >
              Est. band {estimatedBand > 0 ? estimatedBand.toFixed(1) : "—"}
            </span>
            <span
              className={cn(
                "text-meta",
                saved ? "text-emerald-700" : "text-[var(--reading-ink-muted)]",
              )}
            >
              {saved ? "Saved" : "Saving…"}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <section
            className="min-h-[34vh] border-b border-[var(--reading-border)] bg-[var(--reading-paper)] p-4 lg:min-h-0 lg:w-[min(44%,560px)] lg:border-b-0 lg:border-r lg:p-6 lg:overflow-y-auto"
            aria-label="Task prompt"
          >
            {task && activePart === 2 ? (
              <WritingTask2Prompt
                task={task}
                minutes={40}
                minWords={minWords}
              />
            ) : task ? (
              <WritingTask1Prompt task={task} minutes={20} minWords={minWords} />
            ) : null}
          </section>

          <section className="flex min-h-[280px] flex-1 flex-col bg-[var(--reading-surface)] p-4 lg:p-6">
            <label htmlFor="essay" className="sr-only">
              Your response
            </label>
            <textarea
              id="essay"
              value={essay}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Type your response here…"
              className="answer-input min-h-[240px] flex-1 resize-none rounded-lg border border-[var(--reading-border)] bg-white p-4 text-[var(--reading-ink)] transition-colors duration-200 focus:border-[var(--reading-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--reading-accent)]/20"
            />
            {error ? (
              <p className="mt-2 text-[13px] text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <div className="sticky-test-actions mt-4 flex justify-end gap-3 border-t border-[var(--reading-border)] pt-4">
              <Button
                variant="primary"
                disabled={busy}
                onClick={() => void submitTask()}
              >
                {busy
                  ? "Submitting…"
                  : activePart === 1
                    ? "Continue to Task 2"
                    : "Submit Writing"}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </TestShell>
  );
}
