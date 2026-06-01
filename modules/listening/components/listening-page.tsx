"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { cacheMockNavHint } from "@/lib/mock-nav-cache";
import type { ListeningBootServer } from "@/lib/mock-server";
import {
  cacheCheckpointSubmit,
  cacheSectionAdvance,
  consumeSectionAdvance,
  type SectionAdvanceNotice,
} from "@/lib/mock-checkpoint-cache";
import {
  MOCK_DISPLAY_LABEL,
  mockAfterSectionSubmitPath,
  mockHubPath,
  TEST1_LISTENING_PART_COUNT,
} from "@/lib/mock-catalog";
import {
  isListeningTest,
  listeningModuleResultsPath,
  listeningTestHubPath,
} from "@/lib/listening-test";
import { IeltsExamSkeleton } from "@/components/exam/ielts-exam-skeleton";
import { IeltsExamToolbar } from "@/components/exam/ielts-exam-toolbar";
import { listeningApi } from "@/modules/listening/services/listening-api";
import { useListeningStore } from "@/modules/listening/store/listening-store";
import { useListeningTimer } from "@/modules/listening/hooks/use-listening-timer";
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
import {
  groupInstruction,
  instructionForQuestion,
  sortedPartQuestions,
} from "@/modules/listening/lib/part-instructions";
import { GREENFIELD_LISTENING_STAGES } from "@/modules/listening/listening-test-stages";
import { useListeningMockGuard } from "@/modules/listening/hooks/use-listening-mock-guard";

type Props = {
  testId: string;
  mockSlug?: string;
  part?: number;
  variant?: "default" | "exam";
  initialBoot?: ListeningBootServer | null;
};

export function ListeningPage({
  testId,
  mockSlug = "m01",
  part = 1,
  variant = "default",
  initialBoot = null,
}: Props) {
  const isExam = variant === "exam";
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();
  const autoStart = searchParams.get("auto") === "1";
  const sectionStart = searchParams.get("section_start") === "1";
  const mockAttemptId = searchParams.get("mock_attempt");
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
  const [sectionAdvance, setSectionAdvance] = useState<SectionAdvanceNotice | null>(
    null,
  );

  const { schedule, flushNow } = useAutosave(state.attemptId);

  const submissionActive = state.status === "in_progress";

  const stageMeta = GREENFIELD_LISTENING_STAGES.find((s) => s.part === part);

  const goToResults = useCallback(
    (
      _attemptId: string,
      opts?: { mockListeningComplete?: boolean; mockNextPart?: number | null },
    ) => {
      if (mockAttemptId) {
        const dest =
          opts?.mockListeningComplete === true
            ? mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "listening", {
                completedPart: TEST1_LISTENING_PART_COUNT,
                attemptId: _attemptId,
              })
            : mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "listening", {
                completedPart: part,
                attemptId: _attemptId,
              });
        replace(dest);
        return;
      }
      push(listeningModuleResultsPath(testId, _attemptId));
    },
    [replace, push, testId, mockSlug, mockAttemptId, part],
  );

  const submitAnswers = useMemo(
    () =>
      allQuestions.map((q) => ({
        question_id: q.id,
        user_answer: (state.answers[q.id] ?? "").trim(),
      })),
    [allQuestions, state.answers],
  );

  const handleSubmit = useCallback(async () => {
    if (!state.attemptId || state.status === "submitting") return;
    setBusy(true);
    dispatch({ type: "submitting" });
    try {
      await flushNow();
      const payload = await listeningApi.submit(state.attemptId, submitAnswers);
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
          next_module: payload.mock_listening_complete ? "reading" : "listening",
          next_part: payload.mock_listening_complete
            ? 1
            : payload.mock_next_part ?? part + 1,
        });
      }
      dispatch({ type: "completed", payload });
      clearSnapshot(state.attemptId);
      void goToResults(payload.attempt_id, {
        mockListeningComplete: payload.mock_listening_complete === true,
      });
    } catch (e) {
      dispatch({
        type: "error",
        message: e instanceof ApiError ? e.message : "Submit failed.",
      });
      setBusy(false);
    }
  }, [
    state.attemptId,
    state.status,
    submitAnswers,
    dispatch,
    flushNow,
    goToResults,
    mockAttemptId,
    part,
  ]);

  const onTimerExpire = useCallback(() => {
    if (!submissionActive || busy) return;
    void handleSubmit();
  }, [submissionActive, busy, handleSubmit]);

  const remaining = useListeningTimer({
    startedAtIso: state.startedAtIso,
    serverTimeIso: state.serverTimeIso,
    durationSeconds: state.durationSeconds,
    active: submissionActive,
    onExpire: onTimerExpire,
  });

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
    [testId, part, mockAttemptId, sectionStart, dispatch],
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
    enabled: isExam,
    mockAttemptId,
    mockSlug,
    part,
    sectionStart,
    replace,
  });

  useEffect(() => {
    if (!isExam) return;
    if (hydratedFromServerRef.current || initialBoot?.parts?.length) return;
    if (bootedRef.current) return;
    if (state.status !== "idle") return;
    bootedRef.current = true;
    void beginAttempt(false);
  }, [isExam, state.status, beginAttempt, part, mockAttemptId, initialBoot]);

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
    },
    [markPartPlayed, state.parts],
  );

  const answeredCount = useMemo(
    () => allQuestions.filter((q) => (state.answers[q.id] ?? "").trim()).length,
    [allQuestions, state.answers],
  );

  if (isExam) {
    if (
      state.status === "idle" ||
      state.status === "starting" ||
      state.status === "ready"
    ) {
      return <IeltsExamSkeleton />;
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

    if (state.status === "in_progress" && state.parts.length > 0) {
      const examPart =
        state.parts.find((p) => p.part === part) ?? state.parts[0];
      const ordered = sortedPartQuestions(examPart);
      const current =
        ordered.find((q) => q.id === state.currentQuestionId) ?? ordered[0];
      const instruction = current
        ? instructionForQuestion(examPart, current)
        : groupInstruction(examPart);
      const testTitle = mockAttemptId
        ? MOCK_DISPLAY_LABEL
        : (state.test?.title ?? stageMeta?.context ?? "Listening");
      const stageLabel = mockAttemptId
        ? `Part ${part} of ${TEST1_LISTENING_PART_COUNT}`
        : (stageMeta?.title ?? `Part ${part}`);
      const hubHref = mockAttemptId
        ? mockHubPath(mockSlug)
        : listeningTestHubPath();
      const mockSubmitLabel = mockAttemptId
        ? part >= TEST1_LISTENING_PART_COUNT
          ? "Finish listening"
          : `Submit Part ${part} & continue`
        : undefined;

      return (
        <div className="flex min-h-dvh flex-col">
          <IeltsExamToolbar
            moduleName="Listening"
            stageLabel={stageLabel}
            testTitle={testTitle}
            hubHref={hubHref}
            hubLabel={mockAttemptId ? "← Test 1" : "← Back"}
            sectionHint={
              mockAttemptId
                ? `Listening · Part ${part} of ${TEST1_LISTENING_PART_COUNT} · 30 min total`
                : undefined
            }
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
                sectionAutoplay={!Boolean(state.playedParts[examPart.part])}
              />
            </div>
            <div className="min-h-[52vh] border-t border-[var(--exam-border)] lg:min-h-0 lg:w-[min(44%,480px)] lg:shrink-0 lg:border-l lg:border-t-0 lg:max-h-[calc(100dvh-3rem)]">
              <ListeningQuestionsPanel
                part={examPart}
                answers={state.answers}
                currentQuestionId={state.currentQuestionId}
                onAnswer={handleAnswerChange}
                onFocus={setCurrent}
                instruction={instruction}
              />
            </div>
          </div>
        </div>
      );
    }

    return <IeltsExamSkeleton />;
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
          className="mt-5 min-h-[44px] cursor-pointer rounded-xl bg-teal px-5 py-2 text-body font-semibold text-white hover:bg-teal-light disabled:opacity-60"
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
          onBeforeSubmit={async () => {
            dispatch({ type: "submitting" });
            await flushNow();
          }}
          onSubmitted={(payload) => {
            dispatch({ type: "completed", payload });
            if (state.attemptId) clearSnapshot(state.attemptId);
            void goToResults(payload.attempt_id, {
              mockListeningComplete: payload.mock_listening_complete === true,
            });
          }}
          onError={(msg) => dispatch({ type: "error", message: msg })}
        />
      </div>
    </div>
  );
}
