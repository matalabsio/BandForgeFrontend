export type ExpectedSpeakingResponse = {
  questionId: string;
  part: 1 | 2 | 3;
  sequence: number;
};

export type RecoveredSpeakingResponse = {
  question_id: string;
  status: string;
};

export type SpeakingLocalResponseStatus =
  | "idle"
  | "preparing"
  | "recording"
  | "captured"
  | "queued"
  | "uploading"
  | "uploaded"
  | "failed"
  | "unrecoverable";

export type SpeakingLocalResponse = ExpectedSpeakingResponse & {
  status: SpeakingLocalResponseStatus;
  durationSec: number | null;
  capturedAt: string | null;
  error: string | null;
  idempotencyKey?: string | null;
  prepStartedAt?: string | null;
};

export type SpeakingResponseState = {
  responses: Record<string, SpeakingLocalResponse>;
};

export type SpeakingResponseAction =
  | { type: "recover"; questionIds: readonly string[] }
  | { type: "capture"; questionId: string; durationSec: number; capturedAt?: string }
  | { type: "queue"; questionId: string }
  | { type: "upload_start"; questionId: string }
  | { type: "upload_success"; questionId: string }
  | { type: "upload_failure"; questionId: string; error: string }
  | { type: "crash_recovery"; questionIds: readonly string[] };

const ACCEPTED_SERVER_STATUSES = new Set(["confirmed", "processing", "completed"]);

export function createSpeakingResponseState(
  expected: ExpectedSpeakingResponse[],
): SpeakingResponseState {
  return {
    responses: Object.fromEntries(
      expected.map((response) => [
        response.questionId,
        {
          ...response,
          status: "idle" as const,
          durationSec: null,
          capturedAt: null,
          error: null,
        },
      ]),
    ),
  };
}

export function speakingResponseReducer(
  state: SpeakingResponseState,
  action: SpeakingResponseAction,
): SpeakingResponseState {
  if (action.type === "recover" || action.type === "crash_recovery") {
    const ids = new Set(action.questionIds);
    return {
      responses: Object.fromEntries(
        Object.entries(state.responses).map(([id, response]) => {
          if (!ids.has(id)) return [id, response];
          return [
            id,
            {
              ...response,
              status: action.type === "recover" ? "uploaded" : "unrecoverable",
              error:
                action.type === "crash_recovery"
                  ? "Audio was kept only in memory and cannot be recovered after a crash. Record this answer again while online."
                  : null,
            },
          ];
        }),
      ),
    };
  }

  const current = state.responses[action.questionId];
  if (!current) return state;
  let next: SpeakingLocalResponse;
  switch (action.type) {
    case "capture":
      next = {
        ...current,
        status: "captured",
        durationSec: action.durationSec,
        capturedAt: action.capturedAt ?? new Date().toISOString(),
        error: null,
      };
      break;
    case "queue":
      next = { ...current, status: "queued", error: null };
      break;
    case "upload_start":
      next = { ...current, status: "uploading", error: null };
      break;
    case "upload_success":
      next = { ...current, status: "uploaded", error: null };
      break;
    case "upload_failure":
      next = { ...current, status: "failed", error: action.error };
      break;
  }
  return { responses: { ...state.responses, [action.questionId]: next } };
}

export function acceptedRecoveredQuestionIds(
  responses: RecoveredSpeakingResponse[],
): Set<string> {
  return new Set(
    responses
      .filter((response) => ACCEPTED_SERVER_STATUSES.has(response.status))
      .map((response) => response.question_id),
  );
}

export function missingExpectedResponseIds(
  expected: ExpectedSpeakingResponse[],
  uploadedQuestionIds: ReadonlySet<string>,
): string[] {
  return expected
    .filter((response) => !uploadedQuestionIds.has(response.questionId))
    .map((response) => response.questionId);
}

export function hasAllExpectedResponses(
  expected: ExpectedSpeakingResponse[],
  uploadedQuestionIds: ReadonlySet<string>,
): boolean {
  return expected.length > 0 && missingExpectedResponseIds(expected, uploadedQuestionIds).length === 0;
}
