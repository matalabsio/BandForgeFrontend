"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  isListeningTest,
  listeningModuleResultsPath,
} from "@/lib/listening-test";
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

type Props = {
  testId: string;
  variant?: "default" | "exam";
};

export function ListeningPage({ testId, variant = "default" }: Props) {
  const isExam = variant === "exam";
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoStart = searchParams.get("auto") === "1";
  const autoStartedRef = useRef(false);
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

  const { schedule, flushNow } = useAutosave(state.attemptId);

  const submissionActive = state.status === "in_progress";

  const goToResults = useCallback(
    (attemptId: string) => {
      router.push(listeningModuleResultsPath(testId, attemptId));
    },
    [router, testId],
  );

  const onTimerExpire = useCallback(() => {
    if (!submissionActive) return;
    void (async () => {
      const answers = Object.entries(state.answers).map(([question_id, user_answer]) => ({
        question_id,
        user_answer,
      }));
      try {
        if (!state.attemptId) return;
        dispatch({ type: "submitting" });
        await flushNow();
        const payload = await listeningApi.submit(state.attemptId, answers);
        dispatch({ type: "completed", payload });
        clearSnapshot(state.attemptId);
        goToResults(state.attemptId);
      } catch (e) {
        dispatch({
          type: "error",
          message: e instanceof ApiError ? e.message : "Auto-submission failed.",
        });
      }
    })();
  }, [
    submissionActive,
    state.answers,
    state.attemptId,
    dispatch,
    flushNow,
    goToResults,
  ]);

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

  const beginAttempt = useCallback(async () => {
    setBusy(true);
    dispatch({ type: "starting" });
    try {
      const start = await listeningApi.start(testId);
      dispatch({ type: "started", payload: start });
      const questions = await listeningApi.questions(testId);
      dispatch({ type: "questions_loaded", payload: questions });
      const snapshot = readSnapshot(start.attempt_id);
      if (snapshot?.answers) {
        dispatch({ type: "hydrate_answers", answers: snapshot.answers });
      }
      if (snapshot?.played) {
        dispatch({ type: "hydrate_played", played: snapshot.played });
      }
      if (snapshot?.played_parts) {
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
        } else if (e.status === 503) {
          message =
            "Backend API is not reachable. In a terminal: cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000";
        }
      }
      dispatch({ type: "error", message });
    } finally {
      setBusy(false);
    }
  }, [testId, dispatch]);

  useEffect(() => {
    if (!autoStart || autoStartedRef.current) return;
    if (state.status !== "idle") return;
    autoStartedRef.current = true;
    void beginAttempt();
  }, [autoStart, state.status, beginAttempt]);

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

  const submitAnswers = useMemo(
    () =>
      allQuestions.map((q) => ({
        question_id: q.id,
        user_answer: (state.answers[q.id] ?? "").trim(),
      })),
    [allQuestions, state.answers],
  );

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
      if (typeof window !== "undefined") {
        const el = document.getElementById(`part-${partNumber}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [setCurrent],
  );

  const handlePartPlayed = useCallback(
    (partNumber: number) => {
      const part = state.parts.find((p) => p.part === partNumber);
      const questionIds = part?.questions.map((q) => q.id) ?? [];
      markPartPlayed(partNumber, questionIds);
    },
    [markPartPlayed, state.parts],
  );

  if (state.status === "idle" || state.status === "starting") {
    if (isExam) {
      return (
        <div className="mx-auto max-w-md pt-8 sm:pt-16">
          <div className="border border-[#e4e4e7] bg-white px-6 py-8 sm:px-10 sm:py-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a1a1aa]">
              Academic · Listening
            </p>
            <h1 className="mt-2 text-[22px] font-semibold tracking-tight text-[#18181b]">
              Greenfield College
            </h1>
            <p className="mt-1 text-[14px] text-[#52525b]">Part 1 · Questions 1–10</p>

            <ul className="mt-8 space-y-2 text-[13px] leading-relaxed text-[#52525b]">
              <li className="flex gap-2">
                <span className="text-[#a1a1aa]">—</span>
                <span>Audio plays once. You cannot pause or replay.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#a1a1aa]">—</span>
                <span>Write no more than two words and/or a number per answer.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#a1a1aa]">—</span>
                <span>30 minutes. Timer starts when you begin.</span>
              </li>
            </ul>

            <button
              type="button"
              disabled={busy}
              onClick={() => void beginAttempt()}
              className="mt-8 w-full min-h-[48px] cursor-pointer border border-[#18181b] bg-[#18181b] text-[14px] font-semibold text-white transition-colors hover:bg-[#27272a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Preparing…" : autoStart ? "Continue test" : "Begin test"}
            </button>
            {state.error ? (
              <p className="mt-4 border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">
                {state.error}
              </p>
            ) : null}
          </div>
        </div>
      );
    }

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
    if (isExam) {
      return (
        <div className="border border-[#fecaca] bg-[#fef2f2] px-5 py-6">
          <h2 className="text-[15px] font-semibold text-[#18181b]">Unable to start</h2>
          <p className="mt-2 text-[13px] text-[#52525b]">{state.error}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="mt-4 cursor-pointer border border-[#18181b] bg-white px-4 py-2 text-[13px] font-medium text-[#18181b] hover:bg-[#fafafa]"
          >
            Try again
          </button>
        </div>
      );
    }

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

  if (isExam) {
    return (
      <div className="-mx-4 sm:-mx-6">
        <PartNav
          parts={state.parts}
          answers={state.answers}
          played={state.played}
          playedParts={state.playedParts}
          currentQuestionId={state.currentQuestionId}
          onJump={handleJump}
          variant="exam"
          timerSlot={
            <ListeningTimer remainingSeconds={remaining} active={submissionActive} />
          }
        />

        <div className="px-4 sm:px-6">
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
              variant="exam"
            />
          ))}
        </div>

        <div className="sticky bottom-0 z-10 mt-8 border-t border-[#e4e4e7] bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#a1a1aa]">
              Answers save automatically
            </p>
            <SubmissionButton
              attemptId={state.attemptId}
              answers={submitAnswers}
              variant="exam"
              disabled={state.status === "submitting"}
              onBeforeSubmit={async () => {
                dispatch({ type: "submitting" });
                await flushNow();
              }}
              onSubmitted={(payload) => {
                dispatch({ type: "completed", payload });
                if (state.attemptId) clearSnapshot(state.attemptId);
                goToResults(payload.attempt_id);
              }}
              onError={(msg) => dispatch({ type: "error", message: msg })}
            />
          </div>
        </div>
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
            goToResults(payload.attempt_id);
          }}
          onError={(msg) => dispatch({ type: "error", message: msg })}
        />
      </div>
    </div>
  );
}
