"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_MOCK_SLUG,
  mockAfterWritingSubmitPath,
  mockModulePath,
  mockHubPath,
  mockResultsPath,
  TEST1_WRITING_TASK_COUNT,
} from "@/lib/mock-catalog";
import { cacheMockNavHint, shouldSkipMockGuard } from "@/lib/mock-nav-cache";
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
import { TestHeader, TestShell, TestTimer, WordCounter } from "@/modules/shared";
import { cn } from "@/lib/utils";

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

  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [task, setTask] = useState<WritingTask | null>(null);
  const [essay, setEssay] = useState("");
  const [saved, setSaved] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(
    part === 1 ? 20 * 60 : 40 * 60,
  );
  const [remaining, setRemaining] = useState(durationSeconds);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootedRef = useRef(false);

  const minWords =
    task?.options?.min_words ?? writingMinWords(part);

  const wordCount = useMemo(() => countWords(essay), [essay]);
  const estimatedBand = useMemo(
    () => estimateWritingBand(wordCount, part),
    [wordCount, part],
  );

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
      setPhase("ready");
    } catch (e) {
      if (e instanceof ApiError && e.status === 403 && mockAttemptId) {
        router.replace(mockResultsPath(mockSlug, mockAttemptId));
        return;
      }
      setError(e instanceof Error ? e.message : "Could not start writing task.");
      setPhase("error");
    }
  }, [mockTestId, part, mockAttemptId, mockSlug, router]);

  useEffect(() => {
    if (initialBoot?.task) {
      if (bootedRef.current) return;
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
      setPhase("ready");
      return;
    }
    if (!autoStart) {
      setPhase("loading");
      return;
    }
    if (bootedRef.current) return;
    bootedRef.current = true;
    void beginSession();
  }, [autoStart, beginSession, initialBoot, mockAttemptId, part]);

  useEffect(() => {
    if (!mockAttemptId) return;
    if (shouldSkipMockGuard(mockAttemptId, sectionStart)) return;
    let cancelled = false;
    void (async () => {
      try {
        const p = await fetchMockProgressDeduped(mockAttemptId);
        if (cancelled) return;
        if (p.status === "completed") {
          router.replace(mockResultsPath(mockSlug, mockAttemptId));
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
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
        autosaveRef.current = null;
      }
    };
  }, []);

  const scheduleAutosave = useCallback(
    (value: string) => {
      if (!attemptId || !task) return;
      setSaved(false);
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
      autosaveRef.current = setTimeout(() => {
        void writingApi
          .autosave(attemptId, task.id, value)
          .then(() => setSaved(true))
          .catch(() => setSaved(false));
        try {
          localStorage.setItem(storageKey(attemptId), value);
        } catch {
          /* ignore */
        }
      }, 600);
    },
    [attemptId, task],
  );

  const handleChange = (value: string) => {
    setEssay(value);
    scheduleAutosave(value);
  };

  const submitTask = async () => {
    if (!attemptId || !task || busy) return;
    const trimmed = essay.trim();
    if (!trimmed) {
      setError("Please write your response before submitting.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
        autosaveRef.current = null;
      }
      await writingApi.autosave(attemptId, task.id, trimmed);
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
          result.mock_next_module === "speaking" ||
          result.status === "completed"
        ) {
          router.push(
            `/mock/${mockSlug}/results?mock_attempt=${encodeURIComponent(mockAttemptId)}`,
          );
          return;
        }
        if (result.next_part === 2 && part === 1 && TEST1_WRITING_TASK_COUNT > 1) {
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
      setError(e instanceof Error ? e.message : "Submit failed.");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "loading") {
    return (
      <TestShell header={<TestHeader timer={<span className="text-meta">Loading…</span>} />}>
        <main className="flex flex-1 items-center justify-center p-8 text-[14px] text-ink/60">
          Preparing writing task…
        </main>
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

  return (
    <TestShell
      header={<TestHeader timer={<TestTimer remainingSeconds={remaining} />} />}
    >
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
          <p className="text-meta font-semibold text-navy">
            Writing Task {part}
            {mockAttemptId ? " · Full mock" : ""}
          </p>
          <div className="flex items-center gap-4">
            <WordCounter count={wordCount} min={minWords} />
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-meta font-semibold tabular-nums",
                wordCount >= minWords
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-surface text-ink/55",
              )}
              title={`Estimated band from word count (minimum ${minWords} words)`}
            >
              Est. band {estimatedBand > 0 ? estimatedBand.toFixed(1) : "—"}
            </span>
            <span
              className={cn(
                "text-meta",
                saved ? "text-success" : "text-ink/45",
              )}
            >
              {saved ? "Saved" : "Saving…"}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:p-6">
          <section
            className="lg:w-2/5 lg:overflow-y-auto"
            aria-label="Task prompt"
          >
            <p className="text-question mt-1 leading-relaxed text-ink" data-test-question>
              {task?.prompt}
            </p>
            {task?.options?.image_url ? (
              <img
                src={task.options.image_url}
                alt="Task 1 visual"
                className="mt-4 max-w-full rounded-lg border border-border"
              />
            ) : part === 1 ? (
              <p className="mt-4 text-meta text-ink/50">
                Chart image will appear here when available.
              </p>
            ) : null}
            {part === 2 ? (
              <aside className="mt-4 rounded-lg border border-border bg-surface p-4">
                <p className="text-meta font-semibold text-navy">Tips</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-meta text-ink/65">
                  <li>State your position in the introduction</li>
                  <li>Use clear paragraphs with one main idea each</li>
                  <li>Leave time to proofread</li>
                </ul>
              </aside>
            ) : null}
          </section>

          <section className="flex min-h-[280px] flex-1 flex-col">
            <label htmlFor="essay" className="sr-only">
              Your response
            </label>
            <textarea
              id="essay"
              value={essay}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Type your response here…"
              className="answer-input min-h-[240px] flex-1 resize-none rounded-lg border border-border bg-white p-4 text-ink transition-colors duration-200 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
            />
            {error ? (
              <p className="mt-2 text-[13px] text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <div className="sticky-test-actions mt-4 flex justify-end gap-3">
              <Button
                variant="primary"
                disabled={busy}
                onClick={() => void submitTask()}
              >
                {busy ? "Submitting…" : "Submit task"}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </TestShell>
  );
}
