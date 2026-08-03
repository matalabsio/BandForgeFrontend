"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { cacheMockNavHint } from "@/lib/mock-nav-cache";
import type { ListeningBootServer } from "@/lib/mock-boot-types";
import {
  cacheCheckpointSubmit,
  cacheSectionAdvance,
  consumeSectionAdvance,
  type SectionAdvanceNotice,
} from "@/lib/mock-checkpoint-cache";
import {
  getMockMeta,
  mockAfterSectionSubmitPath,
  mockHubPath,
  mockPathFromProgress,
  shortModuleResultsPath,
  testNumberForMockId,
  type MockMeta,
} from "@/lib/mock-catalog";
import { sectionResultsPathForMockSubmit } from "@/lib/mock-section-continue";
import {
  isListeningTest,
  listeningTestHubPath,
} from "@/lib/listening-test";
import { listeningOptionLabelFromValue } from "@/modules/listening/lib/listening-option-value";
import { IeltsExamSkeleton } from "@/components/exam/ielts-exam-skeleton";
import { ExamBusyOverlay } from "@/modules/shared/components/exam-section-loader";
import { IeltsExamToolbar } from "@/components/exam/ielts-exam-toolbar";
import { listeningApi } from "@/modules/listening/services/listening-api";
import { useListeningStore } from "@/modules/listening/store/listening-store";
import { useListeningTimer } from "@/modules/listening/hooks/use-listening-timer";
import { useExamExpiryCatchUp } from "@/modules/shared/hooks/use-exam-expiry-catchup";
import { useExamSessionGuard } from "@/modules/shared/hooks/use-exam-session-refresh";
import {
  formatExamSubmitError,
  submitWithExamSession,
} from "@/modules/shared/lib/submit-with-exam-session";
import {
  clearSnapshot,
  readSnapshot,
  useAttemptRecovery,
} from "@/modules/listening/hooks/use-attempt-recovery";
import { ListeningTimer } from "@/modules/listening/components/listening-timer";
import { PartNav } from "@/modules/listening/components/part-nav";
import { PartSection } from "@/modules/listening/components/part-section";
import {
  SubmissionButton,
  useAutosave,
} from "@/modules/listening/components/submission-manager";
import { ListeningAudioPanel } from "@/modules/listening/components/listening-audio-panel";
import { ListeningQuestionsPanel } from "@/modules/listening/components/listening-questions-panel";
import { ListeningIntroCard } from "@/modules/listening/components/listening-intro-card";
import { audioPanelInstruction } from "@/modules/listening/lib/listening-question-groups";
import { GREENFIELD_LISTENING_STAGES } from "@/modules/listening/listening-test-stages";
import {
  initialPartAudioPhase,
  questionsBrowsable,
  type ListeningPartAudioPhase,
} from "@/modules/listening/lib/listening-part-intro";
import { useListeningPreviewCountdown } from "@/modules/listening/hooks/use-listening-preview-countdown";
import { useListeningMockGuard } from "@/modules/listening/hooks/use-listening-mock-guard";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { useExamNavFlags } from "@/modules/mock/hooks/use-exam-nav-flags";
import { navigateAfterSectionSubmit } from "@/lib/mock-exam-nav";
import {
  DIAGNOSTIC_LISTENING_PART_COUNT,
  DIAGNOSTIC_NAV_TEST_NUMBER,
  isDiagnosticFlow,
} from "@/lib/diagnostic-catalog";
import {
  diagnosticAfterListeningSubmit,
  navigateAfterDiagnosticSectionSubmit,
} from "@/lib/diagnostic-exam-nav";
import { fetchMockProgressDeduped } from "@/modules/mock/lib/mock-progress-fetch";
import { persistModuleResultAttempt } from "@/lib/exam-session-storage";
import type { PracticeSkill } from "@/lib/practice-types";
import {
  afterPlanStepHref,
  type PlanTaskKind,
} from "@/lib/plan-task-flow";
import { recordPlanDayOutcome } from "@/lib/plan-daily-progress";
import { patchLearningTask } from "@/lib/learning-api";
import { completePracticeHub } from "@/lib/practice-api";

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

type Props = {
  testId: string;
  mockSlug?: string;
  mockMeta?: MockMeta;
  part?: number;
  variant?: "default" | "exam";
  initialBoot?: ListeningBootServer | null;
  testNumber?: number;
  flow?: "mock" | "diagnostic";
  skillContext?: PracticeSkill | null;
  fromPlan?: boolean;
  planTask?: PlanTaskKind | null;
  planTaskId?: string | null;
  planHubId?: string | null;
};

export function ListeningPage({
  testId,
  mockSlug = "m01",
  mockMeta: mockMetaProp,
  part = 1,
  variant = "default",
  initialBoot = null,
  testNumber: testNumberProp,
  flow = "mock",
  skillContext = null,
  fromPlan = false,
  planTask = null,
  planTaskId = null,
  planHubId = null,
}: Props) {
  const isDiagnostic = isDiagnosticFlow(flow, testId);
  const isExam = variant === "exam";
  const { replace, push } = useRouter();
  const resolvedTestNumber = isDiagnostic
    ? DIAGNOSTIC_NAV_TEST_NUMBER
    : (testNumberProp ?? testNumberForMockId(testId));
  const { autoStart, sectionStart } = useExamNavFlags({
    testNumber: resolvedTestNumber,
    module: "listening",
  });
  const mockAttemptId = useResolvedMockAttemptId(testId);
  const bootedRef = useRef(false);
  const hydratedFromServerRef = useRef(false);
  const beginAttemptInFlightRef = useRef<Promise<void> | null>(null);
  const {
    state,
    dispatch,
    setAnswer,
    setCurrent,
    markPlayed,
    markPartPlayed,
    allQuestions,
  } = useListeningStore();
  const [busy, setBusy] = useState(false);
  const [introSeen, setIntroSeen] = useState(false);
  const [introAgreed, setIntroAgreed] = useState(false);
  const [sectionAdvance, setSectionAdvance] = useState<SectionAdvanceNotice | null>(
    null,
  );
  const partPlayed = Boolean(state.playedParts[part]);
  const [partAudioPhase, setPartAudioPhase] = useState<ListeningPartAudioPhase>(
    () => initialPartAudioPhase(partPlayed),
  );

  const { schedule, flushNow } = useAutosave(state.attemptId);
  const mockMeta = useMemo(
    () => mockMetaProp ?? getMockMeta(mockSlug),
    [mockMetaProp, mockSlug],
  );
  const listeningPartCount = isDiagnostic
    ? DIAGNOSTIC_LISTENING_PART_COUNT
    : mockMeta.listeningPartCount;

  const introStorageKey = useMemo(
    () => mockAttemptId ?? `${testId}:listening`,
    [mockAttemptId, testId, part],
  );

  const submissionActive = state.status === "in_progress";
  const examSessionGuardActive = Boolean(state.attemptId);

  useEffect(() => {
    setPartAudioPhase(initialPartAudioPhase(partPlayed));
  }, [part, partPlayed]);

  useEffect(() => {
    if (partPlayed) {
      setPartAudioPhase("complete");
    }
  }, [partPlayed]);

  const handleBeginSection = useCallback(() => {
    setPartAudioPhase("preview");
  }, []);

  const handlePreviewComplete = useCallback(() => {
    setPartAudioPhase("playing");
  }, []);

  const { remaining: previewRemaining, progressPct: previewProgressPct } =
    useListeningPreviewCountdown({
      phase: partAudioPhase,
      onPreviewComplete: handlePreviewComplete,
      resetKey: part,
    });

  const stageMeta = GREENFIELD_LISTENING_STAGES.find((s) => s.part === part);

  const goToResults = useCallback(
    (
      _attemptId: string,
      opts?: { mockListeningComplete?: boolean; mockNextPart?: number | null },
    ) => {
      if (mockAttemptId) {
        if (isDiagnostic) {
          const dest =
            opts?.mockListeningComplete === true
              ? diagnosticAfterListeningSubmit()
              : diagnosticAfterListeningSubmit();
          navigateAfterDiagnosticSectionSubmit(
            { push, replace },
            mockAttemptId,
            dest,
            opts?.mockListeningComplete ? "reading" : "listening",
          );
          return;
        }
        const dest =
          opts?.mockListeningComplete === true
            ? mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "listening", {
                completedPart: listeningPartCount,
                attemptId: _attemptId,
                testNumber: resolvedTestNumber,
              })
            : mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "listening", {
                completedPart: part,
                attemptId: _attemptId,
                testNumber: resolvedTestNumber,
              });
        navigateAfterSectionSubmit(
          { push, replace },
          mockSlug,
          mockAttemptId,
          dest,
          { replace: true },
        );
        return;
      }
      const testNumber = resolvedTestNumber;
      persistModuleResultAttempt(testNumber, "listening", _attemptId);
      push(shortModuleResultsPath(testNumber, "listening"));
    },
    [replace, push, testId, mockSlug, mockAttemptId, part, isDiagnostic, listeningPartCount, resolvedTestNumber],
  );

  /** After each listening part in a mock: per-section results screen. */
  const goToMockSectionResults = useCallback(
    (attemptId: string, completedPart: number) => {
      if (!mockAttemptId) return;
      const testNumber = resolvedTestNumber;
      persistModuleResultAttempt(testNumber, "listening", attemptId);
      replace(
        sectionResultsPathForMockSubmit(mockSlug, "listening", {
          attempt: attemptId,
          part: completedPart,
          mockAttemptId,
          testNumber,
        }),
      );
    },
    [mockAttemptId, mockSlug, replace, resolvedTestNumber],
  );

  const finishPlanListening = useCallback(
    (score?: {
      band?: number | null;
      raw_score?: number | null;
      total_questions?: number | null;
    }) => {
      if (!fromPlan || !planHubId) return false;
      const current = planTask ?? "practice";
      if (current === "practice") {
        recordPlanDayOutcome({
          skill: "listening",
          taskType: "practice",
          band: score?.band ?? null,
          rawScore: score?.raw_score ?? null,
          totalQuestions: score?.total_questions ?? null,
        });
      }
      if (planTaskId) {
        void patchLearningTask(planTaskId, "done").catch(() => {});
      }
      // Listening has Watch + Practice only — Practice completes the hub.
      void completePracticeHub(planHubId).catch(() => {});
      push(
        afterPlanStepHref({
          skill: "listening",
          hubId: planHubId,
          currentTask: current,
          currentTaskId: planTaskId,
          bankNumber: 1,
          preferExercise: true,
        }),
      );
      return true;
    },
    [fromPlan, planHubId, planTask, planTaskId, push],
  );

  const submitAnswers = useMemo(
    () =>
      allQuestions.map((q) => ({
        question_id: q.id,
        user_answer: listeningOptionLabelFromValue(
          (state.answers[q.id] ?? "").trim(),
        ),
      })),
    [allQuestions, state.answers],
  );

  const handleSubmit = useCallback(async () => {
    if (!state.attemptId || state.status === "submitting") return;
    setBusy(true);
    dispatch({ type: "submitting" });
    try {
      const payload = await submitWithExamSession({
        flush: flushNow,
        submit: () => listeningApi.submit(state.attemptId!, submitAnswers),
      });
      const listeningDoneOnClient = part >= listeningPartCount;
      if (mockAttemptId) {
        cacheCheckpointSubmit(payload.attempt_id, {
          band: payload.band,
          raw_score: payload.raw_score,
          total_questions: payload.total_questions,
          skill_breakdown: payload.skill_breakdown ?? {},
        });
        cacheSectionAdvance({
          from: "listening",
          band: payload.band,
          raw_score: payload.raw_score,
          total_questions: payload.total_questions,
        });
        cacheMockNavHint({
          mock_attempt_id: mockAttemptId,
          next_module: listeningDoneOnClient ? "reading" : "listening",
          next_part: listeningDoneOnClient ? 1 : part + 1,
        });
      }
      dispatch({ type: "completed", payload });
      clearSnapshot(state.attemptId);
      if (
        finishPlanListening({
          band: payload.band,
          raw_score: payload.raw_score,
          total_questions: payload.total_questions,
        })
      )
        return;
      if (mockAttemptId && !isDiagnostic) {
        goToMockSectionResults(payload.attempt_id, part);
        return;
      }
      const listeningComplete =
        payload.mock_listening_complete === true || listeningDoneOnClient;
      void goToResults(payload.attempt_id, {
        mockListeningComplete: listeningComplete,
      });
    } catch (e) {
      dispatch({
        type: "error",
        message: formatExamSubmitError(e),
      });
      setBusy(false);
    }
  }, [
    state.attemptId,
    state.status,
    submitAnswers,
    dispatch,
    goToResults,
    goToMockSectionResults,
    finishPlanListening,
    isDiagnostic,
    mockAttemptId,
    part,
    flushNow,
    listeningPartCount,
  ]);

  const expiryFiredRef = useRef(false);

  useEffect(() => {
    expiryFiredRef.current = false;
  }, [state.startedAtIso]);

  const canSubmitOnExpiry =
    submissionActive &&
    Boolean(state.attemptId) &&
    !busy &&
    allQuestions.length > 0;

  const onTimerExpire = useCallback(() => {
    if (expiryFiredRef.current) return;
    if (!canSubmitOnExpiry) return;
    expiryFiredRef.current = true;
    void handleSubmit();
  }, [canSubmitOnExpiry, handleSubmit]);

  const remaining = useListeningTimer({
    startedAtIso: state.startedAtIso,
    serverTimeIso: state.serverTimeIso,
    durationSeconds: state.durationSeconds,
    active: submissionActive,
    onExpire: onTimerExpire,
  });

  useExamExpiryCatchUp({
    remaining,
    canSubmit: canSubmitOnExpiry,
    onExpire: onTimerExpire,
    resetKey: state.startedAtIso,
  });

  useExamSessionGuard(examSessionGuardActive);

  useAttemptRecovery({
    attemptId: state.attemptId,
    startedAtIso: state.startedAtIso,
    answers: state.answers,
    played: state.played,
    playedParts: state.playedParts,
    remainingSeconds: remaining,
    enabled: submissionActive,
  });

  const beginAttempt = useCallback(
    async (forceNew = false) => {
      if (beginAttemptInFlightRef.current) {
        await beginAttemptInFlightRef.current;
        return;
      }
      const task = (async () => {
      setBusy(true);
      dispatch({ type: "starting" });
      // section_start only resets client audio state — do not force_new on API
      // (force_new + completed part 1 => 403; after reading, start normally).
      const freshAudio = sectionStart || forceNew;
      const abandonDbAttempt = forceNew && !sectionStart;
      try {
        const start = await listeningApi.start(testId, {
          forceNew: abandonDbAttempt,
          part,
          mockAttemptId: mockAttemptId ?? undefined,
          includeQuestions: true,
          skillContext: fromPlan ? "listening" : (skillContext ?? undefined),
          fromPlan: fromPlan || undefined,
        });
        dispatch({ type: "started", payload: start });
        if (start.parts?.length && start.test) {
          dispatch({
            type: "questions_loaded",
            payload: {
              test: start.test,
              module: "listening" as const,
              parts: start.parts,
              duration_seconds: start.duration_seconds,
            },
          });
        } else {
          const questions = await listeningApi.questions(testId, { part });
          dispatch({ type: "questions_loaded", payload: questions });
        }
        const snapshot = readSnapshot(start.attempt_id);
        if (snapshot?.answers) {
          dispatch({ type: "hydrate_answers", answers: snapshot.answers });
        }
        if (!freshAudio && snapshot?.played) {
          dispatch({ type: "hydrate_played", played: snapshot.played });
        }
        if (!freshAudio && snapshot?.played_parts) {
          dispatch({ type: "hydrate_played_parts", playedParts: snapshot.played_parts });
        }
      } catch (e) {
        let message = "Could not start listening attempt.";
        if (e instanceof ApiError) {
          message = e.message;
          if (e.status === 404) {
            const detail = e.message.toLowerCase();
            message = detail.includes("mock test not found")
              ? `Listening test not found in Supabase (${testId}). Run: cd backend && python -m scripts.verify_greenfield_mock (apply migration if missing), then refresh.`
              : isListeningTest(testId)
                ? "No listening questions for this test. Run: cd backend && python -m scripts.verify_greenfield_mock, then refresh."
                : "No listening questions for this mock. Run the appropriate seed in Supabase, then refresh.";
          } else if (e.status === 403) {
            if (mockAttemptId) {
              try {
                const progress = await fetchMockProgressDeduped(mockAttemptId);
                const dest = mockPathFromProgress(
                  mockSlug,
                  mockAttemptId,
                  progress,
                  undefined,
                  { testNumber: resolvedTestNumber },
                );
                replace(dest);
                return;
              } catch {
                /* fallback to API error message below */
              }
            }
            message = e.message;
          } else if (e.status === 503) {
            message =
              "Backend API is not reachable. In a terminal: cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000";
          }
        }
        dispatch({ type: "error", message });
      } finally {
        setBusy(false);
      }
      })();
      beginAttemptInFlightRef.current = task;
      try {
        await task;
      } finally {
        beginAttemptInFlightRef.current = null;
      }
    },
    [testId, part, mockAttemptId, sectionStart, dispatch, mockSlug, replace, skillContext, fromPlan, resolvedTestNumber],
  );

  useEffect(() => {
    if (!mockAttemptId) return;
    const notice = consumeSectionAdvance();
    if (notice?.from === "reading") {
      setSectionAdvance(notice);
    }
  }, [mockAttemptId]);

  useEffect(() => {
    if (!isExam) return;

    if (initialBoot?.parts?.length && initialBoot.test) {
      if (hydratedFromServerRef.current && bootedRef.current) return;
      hydratedFromServerRef.current = true;
      bootedRef.current = true;
      dispatch({
        type: "started",
        payload: {
          attempt_id: initialBoot.attempt_id,
          started_at: initialBoot.started_at,
          server_time: initialBoot.server_time,
          status: initialBoot.status,
          module: "listening",
          duration_seconds: initialBoot.duration_seconds,
          resumed: initialBoot.resumed,
        },
      });
      dispatch({
        type: "questions_loaded",
        payload: {
          test: initialBoot.test,
          module: "listening",
          parts: initialBoot.parts as import("@/modules/listening/types").ListeningPart[],
          duration_seconds: initialBoot.duration_seconds,
        },
      });
      return;
    }

    hydratedFromServerRef.current = false;
    dispatch({ type: "reset" });
    bootedRef.current = false;
  }, [isExam, part, mockAttemptId, testId, initialBoot, dispatch]);

  useListeningMockGuard({
    enabled: isExam && !isDiagnostic && !fromPlan,
    mockAttemptId,
    mockSlug,
    part,
    sectionStart,
    replace,
    testNumber: resolvedTestNumber,
  });

  useEffect(() => {
    if (!isExam || part !== 1 || fromPlan) {
      setIntroSeen(true);
      setIntroAgreed(true);
      return;
    }
    if (typeof window === "undefined") return;
    const seen = readConsent("listening", introStorageKey);
    setIntroSeen(seen);
    setIntroAgreed(seen);
  }, [isExam, part, introStorageKey, fromPlan]);

  useEffect(() => {
    if (!isExam) return;
    if (hydratedFromServerRef.current || initialBoot?.parts?.length) return;
    if (bootedRef.current) return;
    if (part === 1 && !introSeen) return;
    if (state.status !== "idle") return;
    bootedRef.current = true;
    void beginAttempt(false);
  }, [isExam, state.status, beginAttempt, part, mockAttemptId, initialBoot, introSeen]);

  useEffect(() => {
    if (!isExam && autoStart && !bootedRef.current && state.status === "idle") {
      bootedRef.current = true;
      void beginAttempt(false);
    }
  }, [isExam, autoStart, state.status, beginAttempt]);

  useEffect(() => {
    if (!submissionActive) return;
    window.history.pushState({ inMock: true }, "");
    const onPop = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState({ inMock: true }, "");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [submissionActive]);

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setAnswer(questionId, value);
      schedule(questionId, value);
    },
    [schedule, setAnswer],
  );

  const handleJump = useCallback(
    (questionId: string, partNumber: number) => {
      setCurrent(questionId);
      if (!isExam && typeof window !== "undefined") {
        const el = document.getElementById(`part-${partNumber}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [setCurrent, isExam],
  );

  const handlePartPlayed = useCallback(
    (partNumber: number) => {
      const p = state.parts.find((x) => x.part === partNumber);
      const questionIds = p?.questions.map((q) => q.id) ?? [];
      markPartPlayed(partNumber, questionIds);
      if (partNumber === part) {
        setPartAudioPhase("complete");
      }
    },
    [markPartPlayed, state.parts, part],
  );

  const answeredCount = useMemo(
    () => allQuestions.filter((q) => (state.answers[q.id] ?? "").trim()).length,
    [allQuestions, state.answers],
  );

  if (isExam) {
    if (part === 1 && !introSeen && state.status === "idle") {
      return (
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
          <ListeningIntroCard
            mockSlug={mockSlug}
            mockMeta={mockMeta}
            onBegin={() => {
              if (typeof window !== "undefined") {
                writeConsent("listening", introStorageKey);
              }
              setIntroSeen(true);
              setIntroAgreed(true);
              bootedRef.current = true;
              void beginAttempt(false);
            }}
            busy={busy}
            agreed={introAgreed}
            onAgreeChange={setIntroAgreed}
          />
        </div>
      );
    }

    if (state.status === "idle" || state.status === "starting") {
      return (
        <IeltsExamSkeleton
          light={fromPlan}
          title={`Loading Listening · Part ${part}`}
          subtitle={
            fromPlan
              ? "Opening your plan practice…"
              : "Fetching questions and audio for this part."
          }
        />
      );
    }

    if (state.status === "error") {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="max-w-md text-[14px] text-red-700" role="alert">
            {state.error}
          </p>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "reset" });
              bootedRef.current = false;
              void beginAttempt(false);
            }}
            className="cursor-pointer rounded-md bg-[var(--exam-accent)] px-5 py-2.5 text-[13px] font-bold text-white"
          >
            Try again
          </button>
        </div>
      );
    }

    if (
      (state.status === "in_progress" || state.status === "submitting") &&
      state.parts.length > 0
    ) {
      const examPart =
        state.parts.find((p) => p.part === part) ?? state.parts[0];
      const instruction = audioPanelInstruction(examPart, mockSlug);
      const questionsVisible = questionsBrowsable(partAudioPhase);
      const testTitle = fromPlan
        ? stageMeta?.title ?? `Part ${part}`
        : mockAttemptId
          ? mockMeta.displayLabel
          : (state.test?.title ?? stageMeta?.context ?? "Listening");
      const stageLabel = mockAttemptId
        ? `Part ${part} of ${listeningPartCount}`
        : (stageMeta?.title ?? `Part ${part}`);
      const hubHref = fromPlan
        ? "/study-plan/today"
        : mockAttemptId
          ? mockHubPath(mockSlug, mockAttemptId)
          : listeningTestHubPath();
      const nextPartLabel = mockAttemptId
        ? part >= listeningPartCount
          ? "Finish listening"
          : "Next Part"
        : "Submit part";
      const mockSubmitLabel = mockAttemptId ? nextPartLabel : undefined;

      const submitting = busy || state.status === "submitting";

      return (
        <div className="flex min-h-dvh flex-col">
          {submitting ? (
            <ExamBusyOverlay
              title={
                fromPlan
                  ? "Submitting…"
                  : part >= listeningPartCount
                    ? "Finishing listening…"
                    : `Submitting Part ${part}…`
              }
              subtitle={
                fromPlan
                  ? "Saving your answers…"
                  : part >= listeningPartCount
                    ? "Saving your answers and opening reading."
                    : `Saving your answers and loading Part ${part + 1}.`
              }
            />
          ) : null}
          <IeltsExamToolbar
            moduleName="Listening"
            stageLabel={stageLabel}
            testTitle={testTitle}
            hubHref={hubHref}
            hubLabel={
              fromPlan
                ? "← Today’s plan"
                : mockAttemptId
                  ? `← ${mockMeta.displayLabel}`
                  : "← Back"
            }
            sectionHint={
              fromPlan
                ? undefined
                : mockAttemptId
                  ? `Listening · Part ${part} of ${listeningPartCount} · ${mockMeta.listeningMinutes} min total`
                  : undefined
            }
            plainHeader={fromPlan}
            submitLabel={mockSubmitLabel}
            remainingSeconds={remaining}
            timerActive={submissionActive}
            answeredCount={answeredCount}
            totalQuestions={allQuestions.length}
            busy={busy}
            onSubmit={() => void handleSubmit()}
          />

          {sectionAdvance ? (
            <p className="shrink-0 border-b border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-[13px] text-emerald-900">
              Reading section complete. Band {sectionAdvance.band.toFixed(1)} (
              {sectionAdvance.raw_score}/{sectionAdvance.total_questions} correct).
              Starting Listening now.
            </p>
          ) : null}

          {state.resumedAttempt && !sectionAdvance ? (
            <p className="shrink-0 border-b border-[var(--exam-accent)]/30 bg-[var(--exam-accent-soft)] px-4 py-2 text-center text-[12px] text-[var(--exam-ink)]">
              Resumed your in-progress attempt. Timer and saved answers restored
              where available.
            </p>
          ) : null}

          {state.error ? (
            <p
              className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-center text-[13px] text-red-700"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div className="min-h-[38vh] flex-1 border-b border-[var(--exam-border)] lg:min-h-0 lg:max-h-[calc(100dvh-3rem)] lg:w-[min(56%,1fr)] lg:border-b-0 lg:border-r">
              <ListeningAudioPanel
                part={examPart}
                played={state.played}
                playedParts={state.playedParts}
                onPlayed={markPlayed}
                onPartPlayed={handlePartPlayed}
                instruction={instruction}
                phase={partAudioPhase}
                onBeginSection={handleBeginSection}
                previewRemaining={previewRemaining}
                previewProgressPct={previewProgressPct}
              />
            </div>
            <div className="min-h-[52vh] border-t border-[var(--exam-border)] lg:min-h-0 lg:w-[min(44%,480px)] lg:shrink-0 lg:border-l lg:border-t-0 lg:max-h-[calc(100dvh-3rem)]">
              <ListeningQuestionsPanel
                part={examPart}
                answers={state.answers}
                currentQuestionId={state.currentQuestionId}
                onAnswer={handleAnswerChange}
                onFocus={setCurrent}
                partPlayed={partPlayed}
                visible={questionsVisible}
                phase={partAudioPhase}
                nextPartLabel={nextPartLabel}
                submitBusy={submitting}
                onSubmitPart={() => void handleSubmit()}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <IeltsExamSkeleton
        light={fromPlan}
        title={`Loading Listening · Part ${part}`}
        subtitle="Preparing your session."
      />
    );
  }

  if (state.status === "idle" || state.status === "starting") {
    return (
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-h3 text-navy">IELTS Listening</h2>
        <p className="mt-2 text-body text-ink/70">
          Listen carefully and complete all questions. Audio plays exactly once
          per clip or part. The 30-minute timer starts when you create the
          attempt.
        </p>
        <ul className="mt-3 list-disc pl-5 text-meta text-ink/70">
          <li>Form completion, MCQ, matching, and note completion types</li>
          <li>Answers autosave as you type</li>
          <li>Submit before the timer expires for a band score</li>
        </ul>
        <button
          type="button"
          disabled={busy}
          onClick={() => void beginAttempt()}
          className="mt-5 min-h-[44px] cursor-pointer rounded-xl bg-teal px-5 py-2 text-body font-semibold text-white hover:bg-cyan-light disabled:opacity-60"
        >
          {busy ? "Loading…" : autoStart ? "Resume listening" : "Start listening attempt"}
        </button>
        {state.error ? (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-meta text-danger">
            {state.error}
          </p>
        ) : null}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-2xl border border-danger/40 bg-danger/5 p-6">
        <h2 className="text-h3 text-navy">Could not start</h2>
        <p className="mt-2 text-body text-ink/70">{state.error}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "reset" })}
          className="mt-5 cursor-pointer rounded-xl border border-border bg-white px-4 py-2 text-meta font-semibold text-navy hover:bg-surface"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-meta font-semibold uppercase tracking-wider text-teal">
            {state.test?.title ?? "IELTS Listening"}
          </p>
          <p className="mt-1 text-[12px] text-ink/55">
            Attempt {state.attemptId}
          </p>
        </div>
        <ListeningTimer remainingSeconds={remaining} active={submissionActive} />
      </div>

      <PartNav
        parts={state.parts}
        answers={state.answers}
        played={state.played}
        playedParts={state.playedParts}
        currentQuestionId={state.currentQuestionId}
        onJump={handleJump}
      />

      <div className="space-y-5">
        {state.parts.map((p) => (
          <PartSection
            key={p.part}
            part={p}
            answers={state.answers}
            played={state.played}
            playedParts={state.playedParts}
            currentQuestionId={state.currentQuestionId}
            onAnswer={handleAnswerChange}
            onFocus={setCurrent}
            onPlayed={markPlayed}
            onPartPlayed={handlePartPlayed}
          />
        ))}
      </div>

      <div className="sticky bottom-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white/95 p-3 shadow-md backdrop-blur">
        <p className="text-meta text-ink/70">
          Audio is single-play. Answers autosave as you type.
        </p>
        <SubmissionButton
          attemptId={state.attemptId}
          answers={submitAnswers}
          disabled={state.status === "submitting"}
          onBeforeSubmit={() => {
            dispatch({ type: "submitting" });
          }}
          onSubmitted={(payload) => {
            dispatch({ type: "completed", payload });
            if (state.attemptId) clearSnapshot(state.attemptId);
            if (
              finishPlanListening({
                band: payload.band,
                raw_score: payload.raw_score,
                total_questions: payload.total_questions,
              })
            )
              return;
            if (mockAttemptId && !isDiagnostic) {
              goToMockSectionResults(payload.attempt_id, part);
              return;
            }
            const listeningComplete =
              payload.mock_listening_complete === true ||
              part >= listeningPartCount;
            void goToResults(payload.attempt_id, {
              mockListeningComplete: listeningComplete,
            });
          }}
          onError={(msg) => dispatch({ type: "error", message: msg })}
        />
      </div>
    </div>
  );
}
