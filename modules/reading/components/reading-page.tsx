"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  cacheCheckpointSubmit,
  cacheSectionAdvance,
} from "@/lib/mock-checkpoint-cache";
import { cacheMockNavHint, shouldSkipMockGuard } from "@/lib/mock-nav-cache";
import type { ReadingBootServer } from "@/lib/mock-server";
import {
  MOCK_DISPLAY_LABEL,
  TEST1_READING_PASSAGE_COUNT,
  mockAfterSectionSubmitPath,
  mockHubPath,
  mockPathFromProgress,
} from "@/lib/mock-catalog";
import { fetchMockProgressDeduped } from "@/modules/mock/lib/mock-progress-fetch";
import { syncExamRoute } from "@/lib/mock-exam-nav";
import { readingModuleResultsPath } from "@/lib/reading-test";
import { readingApi } from "@/modules/reading/services/reading-api";
import type { ReadingQuestion } from "@/modules/reading/types";
import { useListeningTimer } from "@/modules/listening/hooks/use-listening-timer";
import { ReadingExamToolbar } from "@/modules/reading/components/reading-exam-toolbar";
import { ReadingPassagePanel } from "@/modules/reading/components/reading-passage-panel";
import { ReadingQuestionsPanel } from "@/modules/reading/components/reading-questions-panel";
import { ReadingExamSkeleton } from "@/modules/reading/components/reading-exam-skeleton";

const STORAGE_PREFIX = "bf-reading-";

function storageKey(attemptId: string): string {
  return `${STORAGE_PREFIX}${attemptId}`;
}

type Props = {
  testId: string;
  mockSlug?: string;
  passage: number;
  autoStart?: boolean;
  initialBoot?: ReadingBootServer | null;
};

export function ReadingPage({
  testId,
  mockSlug = "m01",
  passage,
  autoStart = true,
  initialBoot = null,
}: Props) {
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();
  const mockAttemptId = searchParams.get("mock_attempt");
  const sectionStart = searchParams.get("section_start") === "1";
  const bootedRef = useRef(false);
  const beginSessionInFlightRef = useRef<Promise<void> | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [serverTimeIso, setServerTimeIso] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(60 * 60);
  const [testTitle, setTestTitle] = useState("Reading passage");
  const [passageText, setPassageText] = useState("");
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeQuestion, setActiveQuestion] = useState(1);
  const autosaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const answeredCount = useMemo(
    () => questions.filter((q) => (answers[q.id] ?? "").trim()).length,
    [questions, answers],
  );

  const setAnswer = useCallback(
    (id: string, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [id]: value };
        if (attemptId) {
          try {
            localStorage.setItem(
              storageKey(attemptId),
              JSON.stringify({ answers: next, passage }),
            );
          } catch {
            /* ignore */
          }
        }
        return next;
      });
      if (!attemptId) return;
      if (autosaveTimers.current[id]) clearTimeout(autosaveTimers.current[id]);
      autosaveTimers.current[id] = setTimeout(() => {
        void readingApi.autosave(attemptId, id, value).catch(() => undefined);
      }, 500);
    },
    [attemptId, passage],
  );

  const goToResults = useCallback(
    (
      id: string,
      submit?: {
        mock_next_module?: string | null;
        mock_next_part?: number | null;
        mock_reading_complete?: boolean;
      },
    ) => {
      if (mockAttemptId && submit) {
        const dest = submit.mock_reading_complete
          ? mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "reading", {
              completedPart: TEST1_READING_PASSAGE_COUNT,
              attemptId: id,
            })
          : mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "reading", {
              completedPart: passage,
              attemptId: id,
            });
        replace(dest);
        return;
      }
      push(readingModuleResultsPath(testId, id));
    },
    [replace, push, testId, mockSlug, mockAttemptId, passage],
  );

  const submitAll = useCallback(async () => {
    if (!attemptId || questions.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const body = questions.map((q) => ({
        question_id: q.id,
        user_answer: (answers[q.id] ?? "").trim(),
      }));
      const result = await readingApi.submit(attemptId, body);
      if (mockAttemptId) {
        cacheCheckpointSubmit(result.attempt_id, {
          band: result.band,
          raw_score: result.raw_score,
          total_questions: result.total_questions,
          skill_breakdown: result.skill_breakdown ?? {},
        });
        cacheSectionAdvance({
          from: "reading",
          band: result.band,
          raw_score: result.raw_score,
          total_questions: result.total_questions,
        });
        cacheMockNavHint({
          mock_attempt_id: mockAttemptId,
          next_module: result.mock_reading_complete ? "listening" : "reading",
          next_part: result.mock_reading_complete
            ? 1
            : result.mock_next_part ?? passage + 1,
        });
      }
      try {
        localStorage.removeItem(storageKey(attemptId));
      } catch {
        /* ignore */
      }
      void goToResults(result.attempt_id, result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Submit failed.");
      setBusy(false);
    }
  }, [attemptId, questions, answers, goToResults, mockAttemptId]);

  const onTimerExpire = useCallback(() => {
    if (!attemptId || busy) return;
    void submitAll();
  }, [attemptId, busy, submitAll]);

  const remaining = useListeningTimer({
    startedAtIso,
    serverTimeIso,
    durationSeconds,
    active: phase === "ready" && Boolean(attemptId),
    onExpire: onTimerExpire,
  });

  const hydrateFromStart = useCallback(
    (
      start: Awaited<ReturnType<typeof readingApi.start>>,
      freshPassage = false,
    ) => {
      setAttemptId(start.attempt_id);
      setStartedAtIso(start.started_at);
      setServerTimeIso(start.server_time);
      setDurationSeconds(start.duration_seconds);
      if (start.test?.title) setTestTitle(start.test.title);
      if (start.passage_text) setPassageText(start.passage_text);
      const qs = start.questions ?? [];
      setQuestions(qs);
      const init: Record<string, string> = {};
      for (const q of qs) init[q.id] = "";
      if (!freshPassage) {
        try {
          const raw = localStorage.getItem(storageKey(start.attempt_id));
          if (raw) {
            const snap = JSON.parse(raw) as { answers?: Record<string, string> };
            if (snap.answers) {
              for (const q of qs) {
                if (snap.answers[q.id]) init[q.id] = snap.answers[q.id];
              }
            }
          }
        } catch {
          /* ignore */
        }
      }
      setAnswers(init);
      if (qs.length > 0) {
        const first = qs[0];
        setActiveQuestion(first.display_number ?? first.question_number);
      }
      setPhase("ready");
    },
    [],
  );

  useEffect(() => {
    if (!mockAttemptId) return;
    if (shouldSkipMockGuard(mockAttemptId, sectionStart)) return;
    let cancelled = false;
    void (async () => {
      try {
        const p = await fetchMockProgressDeduped(mockAttemptId);
        if (cancelled) return;
        if (p.status !== "in_progress") {
          replace(mockHubPath(mockSlug));
          return;
        }
        syncExamRoute({ replace }, mockSlug, mockAttemptId, {
          module: "reading",
          part: passage,
        }, p);
      } catch {
        if (!cancelled) replace(mockHubPath(mockSlug));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mockAttemptId, mockSlug, passage, sectionStart, replace]);

  useLayoutEffect(() => {
    if (initialBoot?.passage_text && initialBoot.questions?.length) {
      if (bootedRef.current) return;
      bootedRef.current = true;
      hydrateFromStart(
        {
          attempt_id: initialBoot.attempt_id,
          started_at: initialBoot.started_at,
          server_time: initialBoot.server_time,
          status: initialBoot.status,
          module: "reading",
          duration_seconds: initialBoot.duration_seconds,
          resumed: initialBoot.resumed,
          test: initialBoot.test ?? { id: testId, title: "Reading" },
          passage_text: initialBoot.passage_text,
          questions: initialBoot.questions as ReadingQuestion[],
        },
        sectionStart,
      );
      return;
    }
    if (beginSessionInFlightRef.current) return;
    bootedRef.current = false;
    setAttemptId(null);
    setPhase("loading");
  }, [passage, mockAttemptId, initialBoot, hydrateFromStart, sectionStart, testId]);

  const beginSession = useCallback(async () => {
    if (beginSessionInFlightRef.current) {
      await beginSessionInFlightRef.current;
      return;
    }
    const task = (async () => {
    setPhase("loading");
    setError(null);
    try {
      const start = await readingApi.start(testId, {
        forceNew: false,
        part: passage,
        mockAttemptId: mockAttemptId ?? undefined,
      });
      if (!start.questions?.length || !start.passage_text) {
        const qs = await readingApi.questions(testId, { part: passage });
        hydrateFromStart(
          {
            ...start,
            test: qs.test,
            passage_text: qs.passage_text,
            questions: qs.questions,
          },
          sectionStart,
        );
      } else {
        hydrateFromStart(start, sectionStart);
      }
    } catch (e) {
      const apiMessage =
        e instanceof ApiError ? e.message : "Could not load this passage. Sign in and try again.";
      if (e instanceof ApiError && e.status === 403 && mockAttemptId) {
        try {
          const p = await fetchMockProgressDeduped(mockAttemptId);
          replace(
            mockPathFromProgress(mockSlug, mockAttemptId, {
              next_module: p.next_module,
              next_part: p.next_part,
              status: p.status,
            }),
          );
          return;
        } catch {
          setPhase("error");
          setError(apiMessage);
          return;
        }
      }
      setPhase("error");
      setError(apiMessage);
    }
    })();
    beginSessionInFlightRef.current = task;
    try {
      await task;
    } finally {
      beginSessionInFlightRef.current = null;
    }
  }, [testId, passage, mockAttemptId, mockSlug, sectionStart, hydrateFromStart, replace]);

  useEffect(() => {
    if (initialBoot?.passage_text && initialBoot.questions?.length) return;
    if (beginSessionInFlightRef.current) return;
    if (bootedRef.current) return;
    bootedRef.current = true;
    void beginSession();
  }, [beginSession, autoStart, passage, initialBoot]);

  if (phase === "loading") {
    return (
      <ReadingExamSkeleton message="Loading reading passage (may take up to 10 seconds)…" />
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-[14px] text-red-700" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void beginSession()}
          className="cursor-pointer rounded-md bg-[var(--reading-accent)] px-5 py-2.5 text-[13px] font-bold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <ReadingExamToolbar
        passage={passage}
        testTitle={mockAttemptId ? MOCK_DISPLAY_LABEL : testTitle}
        hubHref={mockAttemptId ? mockHubPath(mockSlug) : undefined}
        hubLabel={mockAttemptId ? "← Test 1" : undefined}
        sectionHint={
          mockAttemptId
            ? `Passage ${passage} of ${TEST1_READING_PASSAGE_COUNT}`
            : undefined
        }
        submitLabel={
          mockAttemptId
            ? passage < TEST1_READING_PASSAGE_COUNT
              ? `Submit passage ${passage} · Continue`
              : "Finish reading"
            : undefined
        }
        remainingSeconds={remaining}
        timerActive={Boolean(attemptId)}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        busy={busy}
        onSubmit={() => void submitAll()}
      />

      {error ? (
        <p
          className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-center text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-[40vh] flex-1 lg:min-h-0 lg:max-h-[calc(100dvh-3rem)]">
          <ReadingPassagePanel passageText={passageText} />
        </div>
        <div className="min-h-[50vh] border-t border-[var(--reading-border)] lg:min-h-0 lg:w-[min(44%,520px)] lg:shrink-0 lg:border-l lg:border-t-0 lg:max-h-[calc(100dvh-3rem)]">
          <ReadingQuestionsPanel
            questions={questions}
            answers={answers}
            onAnswer={setAnswer}
            activeQuestion={activeQuestion}
            onActiveQuestion={setActiveQuestion}
          />
        </div>
      </div>
    </div>
  );
}
