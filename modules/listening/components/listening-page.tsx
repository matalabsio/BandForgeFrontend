"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
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
  mockTestId: string;
};

export function ListeningPage({ mockTestId }: Props) {
  const router = useRouter();
  const {
    state,
    dispatch,
    setAnswer,
    setCurrent,
    markPlayed,
    allQuestions,
  } = useListeningStore();
  const [busy, setBusy] = useState(false);

  const { schedule, flushNow } = useAutosave(state.attemptId);

  const submissionActive = state.status === "in_progress";

  const goToResults = useCallback(
    (attemptId: string) => {
      router.push(
        `/mock/${encodeURIComponent(mockTestId)}/listening/results/${encodeURIComponent(
          attemptId,
        )}`,
      );
    },
    [router, mockTestId],
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
    remainingSeconds: remaining,
    enabled: submissionActive,
  });

  const beginAttempt = useCallback(async () => {
    setBusy(true);
    dispatch({ type: "starting" });
    try {
      const start = await listeningApi.start(mockTestId);
      dispatch({ type: "started", payload: start });
      const questions = await listeningApi.questions(mockTestId);
      dispatch({ type: "questions_loaded", payload: questions });
      const snapshot = readSnapshot(start.attempt_id);
      if (snapshot?.answers) {
        dispatch({ type: "hydrate_answers", answers: snapshot.answers });
      }
      if (snapshot?.played) {
        dispatch({ type: "hydrate_played", played: snapshot.played });
      }
    } catch (e) {
      dispatch({
        type: "error",
        message:
          e instanceof ApiError
            ? e.message
            : "Could not start listening attempt.",
      });
    } finally {
      setBusy(false);
    }
  }, [mockTestId, dispatch]);

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

  if (state.status === "idle" || state.status === "starting") {
    return (
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-h3 text-navy">IELTS Listening — Full Mock</h2>
        <p className="mt-2 text-body text-ink/70">
          Four parts, twenty short audio clips. Each clip plays exactly once.
          You cannot rewind or repeat. The 30-minute timer starts as soon as
          you create the attempt.
        </p>
        <ul className="mt-3 list-disc pl-5 text-meta text-ink/70">
          <li>Part 1 · Social Dialogue · form &amp; table completion</li>
          <li>Part 2 · Social Monologue · map labels &amp; MCQ</li>
          <li>Part 3 · Academic Seminar · MCQ &amp; matching</li>
          <li>Part 4 · Academic Lecture · note &amp; summary completion</li>
        </ul>
        <button
          type="button"
          disabled={busy}
          onClick={() => void beginAttempt()}
          className="mt-5 min-h-[44px] rounded-xl bg-teal px-5 py-2 text-body font-semibold text-white hover:bg-teal-light disabled:opacity-60"
        >
          {busy ? "Loading…" : "Start listening attempt"}
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
          className="mt-5 rounded-xl border border-border bg-white px-4 py-2 text-meta font-semibold text-navy hover:bg-surface"
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
            {state.test?.title ?? "Listening mock"}
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
            currentQuestionId={state.currentQuestionId}
            onAnswer={handleAnswerChange}
            onFocus={setCurrent}
            onPlayed={markPlayed}
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
