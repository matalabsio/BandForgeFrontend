export type SpeakingSubPhase = "play" | "record" | "part2_prep" | "part2_record" | "ready";

export type SpeakingFlowState = {
  stepIndex: number;
  subPhase: SpeakingSubPhase;
  prepDeadlineMs: number | null;
};

export type SpeakingFlowAction =
  | { type: "question_ended"; isPart2: boolean; prepDeadlineMs?: number }
  | { type: "begin_part2" }
  | { type: "recording_captured" }
  | { type: "advance" }
  | { type: "retry"; isPart2: boolean };

export const initialSpeakingFlowState: SpeakingFlowState = {
  stepIndex: 0,
  subPhase: "play",
  prepDeadlineMs: null,
};

export function speakingFlowReducer(
  state: SpeakingFlowState,
  action: SpeakingFlowAction,
): SpeakingFlowState {
  switch (action.type) {
    case "question_ended":
      if (state.subPhase !== "play") return state;
      return action.isPart2
        ? {
            ...state,
            subPhase: "part2_prep",
            prepDeadlineMs: action.prepDeadlineMs ?? null,
          }
        : { ...state, subPhase: "record" };
    case "begin_part2":
      if (state.subPhase !== "part2_prep") return state;
      return { ...state, subPhase: "part2_record", prepDeadlineMs: null };
    case "recording_captured":
      if (state.subPhase !== "record" && state.subPhase !== "part2_record") return state;
      return { ...state, subPhase: "ready" };
    case "advance":
      return {
        stepIndex: state.stepIndex + 1,
        subPhase: "play",
        prepDeadlineMs: null,
      };
    case "retry":
      return {
        ...state,
        subPhase: action.isPart2 ? "part2_record" : "play",
        prepDeadlineMs: null,
      };
  }
}

export function secondsUntilDeadline(deadlineMs: number | null, nowMs: number): number {
  if (deadlineMs == null) return 0;
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}
