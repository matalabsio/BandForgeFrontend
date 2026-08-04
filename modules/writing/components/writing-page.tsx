"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_MOCK_SLUG,
  getMockMeta,
  mockAfterWritingSubmitPath,
  mockModulePath,
  mockPathFromProgress,
  mockHubPath,
  shortModuleWritingPendingPath,
  TEST1_WRITING_TASK_COUNT,
  testNumberForMockId,
  type MockMeta,
} from "@/lib/mock-catalog";
import { sectionResultsPathForMockSubmit } from "@/lib/mock-section-continue";
import { persistMockAttemptId, persistModuleResultAttempt } from "@/lib/exam-session-storage";
import type { PracticeSkill } from "@/lib/practice-types";
import { type PlanTaskKind } from "@/lib/plan-task-flow";
import { recordPlanDayOutcome } from "@/lib/plan-daily-progress";
import {
  completePlanStepAndGetNextHref,
  shouldCompleteHubForPlanTask,
} from "@/lib/plan-step-completion";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { cacheMockNavHint, shouldSkipMockGuard } from "@/lib/mock-nav-cache";
import { redirectIfMockCompleted } from "@/lib/mock-completed-nav";
import type { WritingBootServer } from "@/lib/mock-boot-types";
import { fetchMockProgressDeduped } from "@/modules/mock/lib/mock-progress-fetch";
import { syncExamRoute, navigateToExamPath } from "@/lib/mock-exam-nav";
import {
  DIAGNOSTIC_MOCK_TEST_ID,
  DIAGNOSTIC_NAV_TEST_NUMBER,
  diagnosticPaths,
  isDiagnosticFlow,
} from "@/lib/diagnostic-catalog";
import {
  diagnosticAfterWritingSubmit,
  navigateAfterDiagnosticSectionSubmit,
} from "@/lib/diagnostic-exam-nav";
import { useExamNavFlags } from "@/modules/mock/hooks/use-exam-nav-flags";
import { writingApi } from "@/modules/writing/services/writing-api";
import type { WritingTask } from "@/modules/writing/types";
import {
  estimateWritingBand,
  writingMinWords,
  writingResultsPath,
} from "@/lib/writing-test";
import { WritingExamWorkspace } from "@/modules/writing/components/writing-exam-workspace";
import { WritingTask1Prompt } from "@/modules/writing/components/writing-task1-prompt";
import { WritingTask2Prompt } from "@/modules/writing/components/writing-task2-prompt";
import { TestHeader, TestShell, TestTimer } from "@/modules/shared";
import { useExamExpiryCatchUp } from "@/modules/shared/hooks/use-exam-expiry-catchup";
import { useListeningTimer } from "@/modules/shared/hooks/use-exam-timer";
import { useExamSessionGuard } from "@/modules/shared/hooks/use-exam-session-refresh";
import {
  formatExamSubmitError,
  submitWithExamSession,
} from "@/modules/shared/lib/submit-with-exam-session";
import {
  ExamBusyOverlay,
} from "@/modules/shared/components/exam-section-loader";
import { SectionInstructionsModal } from "@/modules/shared/components/section-instructions-modal";
import { IeltsExamSkeleton } from "@/components/exam/ielts-exam-skeleton";

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
  mockMeta?: MockMeta;
  autoStart?: boolean;
  initialBoot?: WritingBootServer | null;
  testNumber?: number;
  flow?: "mock" | "diagnostic";
  skillContext?: PracticeSkill | null;
  fromPlan?: boolean;
  planTask?: PlanTaskKind | null;
  planTaskId?: string | null;
  planHubId?: string | null;
};

export function WritingPage({
  mockTestId,
  part,
  mockSlug = DEFAULT_MOCK_SLUG,
  mockMeta: mockMetaProp,
  autoStart: autoStartProp = true,
  initialBoot = null,
  testNumber: testNumberProp,
  flow = "mock",
  skillContext = null,
  fromPlan = false,
  planTask = null,
  planTaskId = null,
  planHubId = null,
}: Props) {
  const isDiagnostic = isDiagnosticFlow(flow, mockTestId);
  const router = useRouter();
  const mockAttemptId = useResolvedMockAttemptId(mockTestId);
  const resolvedTestNumber = isDiagnostic
    ? DIAGNOSTIC_NAV_TEST_NUMBER
    : (testNumberProp ?? testNumberForMockId(mockTestId));
  const { autoStart: navAuto, sectionStart } = useExamNavFlags({
    testNumber: resolvedTestNumber,
    module: "writing",
  });
  const autoStart = navAuto || autoStartProp;

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
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [serverTimeIso, setServerTimeIso] = useState<string | null>(null);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveBlockedRef = useRef(false);
  const bootedRef = useRef(false);
  const needsConsentGateRef = useRef(false);
  const expiryFiredRef = useRef(false);
  const submitInFlightRef = useRef(false);
  const mockMeta = useMemo(
    () => mockMetaProp ?? getMockMeta(mockSlug),
    [mockMetaProp, mockSlug],
  );

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
    if (part !== 1 || fromPlan) {
      setIntroAgreed(true);
      setIntroPassed(true);
      return;
    }
    const seen = readConsent("writing", instructionScope);
    setIntroAgreed(seen);
    setIntroPassed(false);
  }, [part, instructionScope, fromPlan]);

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
    setStartedAtIso(null);
    setServerTimeIso(null);
    setPhase("loading");
  }, [part, mockTestId, mockAttemptId]);

  useEffect(() => {
    expiryFiredRef.current = false;
  }, [startedAtIso]);

  useExamSessionGuard(Boolean(attemptId));

  const beginSession = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await writingApi.start(mockTestId, {
        part,
        mockAttemptId: mockAttemptId ?? undefined,
        forceNew: false,
        // Plan practice uses MT prompts before 12/12 unlock — gate via fromPlan.
        skillContext: fromPlan ? "writing" : (skillContext ?? undefined),
        fromPlan: fromPlan || undefined,
      });
      setAttemptId(res.attempt_id);
      setTask(res.task ?? null);
      setDurationSeconds(res.duration_seconds);
      setStartedAtIso(res.started_at);
      setServerTimeIso(res.server_time);
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
          router.replace(
            mockPathFromProgress(mockSlug, mockAttemptId, progress, undefined, {
              testNumber: resolvedTestNumber,
            }),
          );
          return;
        } catch {
          router.replace(mockHubPath(mockSlug));
          return;
        }
      }
      setError(e instanceof Error ? e.message : "Could not start writing task.");
      setPhase("error");
    }
  }, [mockTestId, part, mockAttemptId, mockSlug, router, resolvedTestNumber, skillContext, fromPlan]);

  useEffect(() => {
    if (initialBoot?.task) {
      if (bootedRef.current) return;
      if (part === 1 && !introPassed) {
        setAttemptId(initialBoot.attempt_id);
        setTask(initialBoot.task as WritingTask);
        setDurationSeconds(initialBoot.duration_seconds);
        setStartedAtIso(initialBoot.started_at);
        setServerTimeIso(initialBoot.server_time);
        const introEssay =
          initialBoot.saved_answer?.trim() ||
          (typeof window !== "undefined"
            ? localStorage.getItem(storageKey(initialBoot.attempt_id)) ?? ""
            : "");
        setEssay(introEssay);
        setPhase("intro");
        return;
      }
      bootedRef.current = true;
      setAttemptId(initialBoot.attempt_id);
      setTask(initialBoot.task as WritingTask);
      setDurationSeconds(initialBoot.duration_seconds);
      setStartedAtIso(initialBoot.started_at);
      setServerTimeIso(initialBoot.server_time);
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
    if (isDiagnostic) {
      let cancelled = false;
      void (async () => {
        try {
          const p = await fetchMockProgressDeduped(mockAttemptId);
          if (cancelled) return;
          if (p.status === "completed") {
            router.replace(diagnosticPaths.results);
          }
        } catch {
          /* ignore */
        }
      })();
      return () => {
        cancelled = true;
      };
    }
    if (shouldSkipMockGuard(mockAttemptId, sectionStart)) return;
    let cancelled = false;
    void (async () => {
      try {
        const p = await fetchMockProgressDeduped(mockAttemptId);
        if (cancelled) return;
        if (redirectIfMockCompleted(p.status, router.replace.bind(router))) {
          return;
        }
        syncExamRoute(
          { replace: router.replace.bind(router) },
          mockSlug,
          mockAttemptId,
          { module: "writing", part },
          p,
          { testNumber: resolvedTestNumber },
        );
      } catch {
        if (!cancelled) router.replace(mockHubPath(mockSlug));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mockAttemptId, mockSlug, part, sectionStart, router, isDiagnostic, mockTestId, resolvedTestNumber]);

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
    setSaved(false);
    if (attemptId) {
      try {
        localStorage.setItem(storageKey(attemptId), value);
      } catch {
        /* ignore */
      }
    }
  };

  useEffect(() => {
    if (!attemptId || !task || autosaveBlockedRef.current) return;
    if (phase !== "ready") return;

    if (autosaveRef.current) {
      clearTimeout(autosaveRef.current);
    }

    autosaveRef.current = setTimeout(() => {
      void writingApi
        .autosave(attemptId, task.id, essay)
        .then(() => setSaved(true))
        .catch(() => setSaved(false));
    }, 1200);

    return () => {
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
        autosaveRef.current = null;
      }
    };
  }, [essay, attemptId, task, phase]);

  const submitTask = useCallback(async (opts?: { onExpiry?: boolean }) => {
    if (!attemptId || !task || busy || submitInFlightRef.current) return;
    if (task.part !== part) {
      setError(null);
      bootedRef.current = false;
      void beginSession();
      return;
    }
    const trimmed = essay.trim();
    if (!trimmed && !opts?.onExpiry) {
      setError("Please write your response before submitting.");
      return;
    }
    submitInFlightRef.current = true;
    setBusy(true);
    setError(null);
    autosaveBlockedRef.current = true;
    try {
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
        autosaveRef.current = null;
      }
      const result = await submitWithExamSession({
        submit: () =>
          writingApi.submit(attemptId, [
            { question_id: task.id, user_answer: trimmed },
          ]),
      });
      try {
        localStorage.removeItem(storageKey(attemptId));
      } catch {
        /* ignore */
      }

      // Personalized plan Writing: sync checklist; hub complete only on final Submit.
      if (fromPlan && planHubId) {
        const current =
          planTask ?? (part === 2 ? "submit" : "practice");
        recordPlanDayOutcome({
          skill: "writing",
          taskType: current,
          band: null,
          rawScore: null,
          totalQuestions: null,
        });
        const nextHref = completePlanStepAndGetNextHref({
          fromPlan,
          skill: "writing",
          hubId: planHubId,
          currentTask: current,
          currentTaskId: planTaskId,
          bankNumber: mockSlug === "m02" ? 2 : 1,
          preferExercise: true,
          completeHub: shouldCompleteHubForPlanTask("writing", current),
        });
        router.push(nextHref ?? "/study-plan/today");
        return;
      }

      if (mockAttemptId) {
        const testNum = resolvedTestNumber;
        cacheMockNavHint({
          mock_attempt_id: mockAttemptId,
          next_module:
            result.mock_next_module ??
            (result.mock_writing_complete ? null : "writing"),
          next_part:
            result.mock_next_part ??
            (result.mock_writing_complete ? null : part + 1),
        });
        if (isDiagnostic) {
          if (result.mock_writing_complete) {
            persistMockAttemptId(DIAGNOSTIC_MOCK_TEST_ID, mockAttemptId);
            navigateAfterDiagnosticSectionSubmit(
              router,
              mockAttemptId,
              diagnosticAfterWritingSubmit(),
              "writing",
            );
            return;
          }
        }
        if (!isDiagnostic) {
          const testNum = resolvedTestNumber;
          persistModuleResultAttempt(testNum, "writing", result.attempt_id);

          const continueToTask2 =
            !result.mock_writing_complete &&
            part === 1 &&
            (result.next_part === 2 ||
              result.mock_next_part === 2 ||
              result.mock_next_module === "writing") &&
            mockMeta.writingTaskCount > 1;

          if (continueToTask2) {
            const path = mockModulePath(mockSlug, "writing", {
              part: 2,
              testNumber: testNum,
            });
            navigateToExamPath(router, mockSlug, path, {
              replace: true,
              mockAttemptId,
              auto: true,
              sectionStart: true,
              testNumber: testNum,
            });
            return;
          }

          // Both tasks done → combined Task 1 / Task 2 results with AI.
          router.replace(
            sectionResultsPathForMockSubmit(mockSlug, "writing", {
              attempt: result.attempt_id,
              part: result.part ?? part,
              mockAttemptId,
              testNumber: testNum,
            }),
          );
          return;
        }
        const goPending =
          result.saved_for_review &&
          !(result.next_part === 2 && part === 1 && !isDiagnostic && TEST1_WRITING_TASK_COUNT > 1);
        if (goPending && testNum) {
          router.push(shortModuleWritingPendingPath(testNum, result.attempt_id));
          return;
        }
        persistModuleResultAttempt(
          resolvedTestNumber,
          "writing",
          result.attempt_id,
        );
        router.push(
          mockAfterWritingSubmitPath(
            mockSlug,
            mockAttemptId,
            part,
            {
              status:
                result.mock_writing_complete && result.mock_next_module == null
                  ? "completed"
                  : undefined,
              next_module: result.mock_next_module,
              next_part: result.mock_next_part,
            },
            result.attempt_id,
            { testNumber: resolvedTestNumber },
          ),
        );
        return;
      }

      if (result.next_part === 2 && part === 1 && !isDiagnostic && TEST1_WRITING_TASK_COUNT > 1) {
        router.push(`/test/writing/task/2?auto=1`);
        return;
      }

      const testNum = resolvedTestNumber;
      if (result.saved_for_review && testNum) {
        router.push(shortModuleWritingPendingPath(testNum, result.attempt_id));
        return;
      }

      persistModuleResultAttempt(
        resolvedTestNumber,
        "writing",
        result.attempt_id,
      );
      router.push(
        writingResultsPath(resolvedTestNumber, result.attempt_id),
      );
    } catch (e) {
      autosaveBlockedRef.current = false;
      setError(formatExamSubmitError(e));
    } finally {
      submitInFlightRef.current = false;
      setBusy(false);
    }
  }, [
    attemptId,
    task,
    busy,
    part,
    essay,
    beginSession,
    mockAttemptId,
    mockSlug,
    router,
    mockMeta.writingTaskCount,
    fromPlan,
    planHubId,
    planTaskId,
    planTask,
    isDiagnostic,
    resolvedTestNumber,
  ]);

  const timerActive = phase === "ready" && Boolean(attemptId);
  const expiryHandlerRef = useRef<() => void>(() => {});

  const remaining = useListeningTimer({
    startedAtIso,
    serverTimeIso,
    durationSeconds,
    active: timerActive,
    onExpire: () => expiryHandlerRef.current(),
  });

  const canSubmitOnExpiry =
    Boolean(attemptId) &&
    Boolean(task) &&
    !busy &&
    (phase === "ready" || (phase === "intro" && remaining <= 0));

  const onTimerExpire = useCallback(() => {
    if (expiryFiredRef.current) return;
    if (!canSubmitOnExpiry) return;
    expiryFiredRef.current = true;
    void submitTask({ onExpiry: true });
  }, [canSubmitOnExpiry, submitTask]);

  useEffect(() => {
    expiryHandlerRef.current = onTimerExpire;
  }, [onTimerExpire]);

  useExamExpiryCatchUp({
    remaining,
    canSubmit: canSubmitOnExpiry,
    onExpire: onTimerExpire,
    resetKey: startedAtIso,
  });

  useEffect(() => {
    if (!startedAtIso || !attemptId || !task) return;
    if (remaining > 0) return;
    if (phase === "intro") {
      setIntroPassed(true);
      setPhase("ready");
    }
  }, [startedAtIso, attemptId, task, remaining, phase]);

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
      <IeltsExamSkeleton
        light
        title={`Loading Writing · Task ${part}`}
        subtitle={
          fromPlan
            ? "Opening your plan task…"
            : "Fetching your task prompt and starting the timer."
        }
      />
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

  if (phase === "intro" && part === 1 && remaining > 0) {
    return (
      <SectionInstructionsModal
        badge={`IELTS Academic · ${mockMeta.displayLabel}`}
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

  const submitLabel = mockAttemptId
    ? activePart === 1
      ? "Next Part"
      : "Finish writing"
    : activePart === 1
      ? "Continue to Task 2"
      : "Submit Writing";

  const promptNode =
    task && activePart === 2 ? (
      <WritingTask2Prompt
        task={task}
        minutes={40}
        minWords={minWords}
        plainHeader={fromPlan}
      />
    ) : task ? (
      <WritingTask1Prompt
        task={task}
        minutes={20}
        minWords={minWords}
        plainHeader={fromPlan}
      />
    ) : null;

  return (
    <>
      {busy ? (
        <ExamBusyOverlay
          title={
            remaining <= 0
              ? "Time's up — submitting…"
              : activePart === 1
                ? "Submitting Task 1…"
                : "Submitting Writing…"
          }
          subtitle={
            remaining <= 0
              ? "Saving your response before the deadline."
              : activePart === 1
                ? "Saving your response and loading Task 2."
                : "Saving your response and opening your results."
          }
        />
      ) : null}
      <WritingExamWorkspace
        activePart={activePart}
        isMock={Boolean(mockAttemptId)}
        displayLabel={fromPlan ? undefined : mockMeta.displayLabel}
        plainHeader={fromPlan}
        remainingSeconds={remaining}
        wordCount={wordCount}
        minWords={minWords}
        estimatedBand={estimatedBand}
        saved={saved}
        busy={busy}
        submitLabel={submitLabel}
        error={error}
        prompt={promptNode}
        essay={essay}
        onEssayChange={handleChange}
        onSubmit={() => void submitTask()}
      />
    </>
  );
}
