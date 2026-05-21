"use client";

import { useReducer, useCallback, useMemo } from "react";
import type {
  ListeningPart,
  ListeningQuestion,
  ListeningQuestionsPayload,
  StartListeningPayload,
  SubmitListeningPayload,
} from "@/modules/listening/types";

export type ListeningSessionStatus =
  | "idle"
  | "starting"
  | "ready"
  | "in_progress"
  | "submitting"
  | "completed"
  | "error";

export type ListeningState = {
  status: ListeningSessionStatus;
  attemptId: string | null;
  startedAtIso: string | null;
  serverTimeIso: string | null;
  durationSeconds: number;
  test: ListeningQuestionsPayload["test"] | null;
  parts: ListeningPart[];
  currentQuestionId: string | null;
  answers: Record<string, string>;
  played: Record<string, true>;
  playedParts: Record<number, true>;
  error: string | null;
  submitResult: SubmitListeningPayload | null;
};

type Action =
  | { type: "starting" }
  | { type: "started"; payload: StartListeningPayload }
  | { type: "questions_loaded"; payload: ListeningQuestionsPayload }
  | { type: "set_current"; questionId: string }
  | { type: "set_answer"; questionId: string; value: string }
  | { type: "mark_played"; questionId: string }
  | { type: "mark_part_played"; partNumber: number; questionIds: string[] }
  | { type: "hydrate_answers"; answers: Record<string, string> }
  | { type: "hydrate_played"; played: Record<string, true> }
  | { type: "hydrate_played_parts"; playedParts: Record<number, true> }
  | { type: "submitting" }
  | { type: "completed"; payload: SubmitListeningPayload }
  | { type: "error"; message: string }
  | { type: "reset" };

const initial: ListeningState = {
  status: "idle",
  attemptId: null,
  startedAtIso: null,
  serverTimeIso: null,
  durationSeconds: 30 * 60,
  test: null,
  parts: [],
  currentQuestionId: null,
  answers: {},
  played: {},
  playedParts: {},
  error: null,
  submitResult: null,
};

function flattenQuestions(parts: ListeningPart[]): ListeningQuestion[] {
  return parts.flatMap((p) => p.questions);
}

function reducer(state: ListeningState, action: Action): ListeningState {
  switch (action.type) {
    case "starting":
      return { ...state, status: "starting", error: null, submitResult: null };
    case "started":
      return {
        ...state,
        attemptId: action.payload.attempt_id,
        startedAtIso: action.payload.started_at,
        serverTimeIso: action.payload.server_time,
        durationSeconds: action.payload.duration_seconds,
        status: "ready",
      };
    case "questions_loaded": {
      const seeded: Record<string, string> = { ...state.answers };
      const all = flattenQuestions(action.payload.parts);
      for (const q of all) {
        if (!(q.id in seeded)) seeded[q.id] = "";
      }
      return {
        ...state,
        test: action.payload.test,
        parts: action.payload.parts,
        durationSeconds: action.payload.duration_seconds,
        answers: seeded,
        currentQuestionId: all[0]?.id ?? null,
        status: "in_progress",
      };
    }
    case "set_current":
      return { ...state, currentQuestionId: action.questionId };
    case "set_answer":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };
    case "mark_played":
      if (state.played[action.questionId]) return state;
      return {
        ...state,
        played: { ...state.played, [action.questionId]: true },
      };
    case "mark_part_played": {
      const played = { ...state.played };
      for (const qid of action.questionIds) {
        played[qid] = true;
      }
      return {
        ...state,
        played,
        playedParts: { ...state.playedParts, [action.partNumber]: true },
      };
    }
    case "hydrate_answers":
      return {
        ...state,
        answers: { ...state.answers, ...action.answers },
      };
    case "hydrate_played":
      return {
        ...state,
        played: { ...state.played, ...action.played },
      };
    case "hydrate_played_parts":
      return {
        ...state,
        playedParts: { ...state.playedParts, ...action.playedParts },
      };
    case "submitting":
      return { ...state, status: "submitting", error: null };
    case "completed":
      return { ...state, status: "completed", submitResult: action.payload };
    case "error":
      return { ...state, status: "error", error: action.message };
    case "reset":
      return initial;
    default:
      return state;
  }
}

export function useListeningStore() {
  const [state, dispatch] = useReducer(reducer, initial);

  const setAnswer = useCallback(
    (questionId: string, value: string) =>
      dispatch({ type: "set_answer", questionId, value }),
    [],
  );
  const setCurrent = useCallback(
    (questionId: string) => dispatch({ type: "set_current", questionId }),
    [],
  );
  const markPlayed = useCallback(
    (questionId: string) => dispatch({ type: "mark_played", questionId }),
    [],
  );
  const markPartPlayed = useCallback(
    (partNumber: number, questionIds: string[]) =>
      dispatch({ type: "mark_part_played", partNumber, questionIds }),
    [],
  );

  const flat = useMemo(() => flattenQuestions(state.parts), [state.parts]);

  return {
    state,
    dispatch,
    setAnswer,
    setCurrent,
    markPlayed,
    markPartPlayed,
    allQuestions: flat,
  };
}

export type ListeningStore = ReturnType<typeof useListeningStore>;
