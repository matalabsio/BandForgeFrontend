import {
  ApiError,
  parseApiError,
  parseJsonResponse,
  type ApiErrorBody,
} from "@/lib/api";
import type {
  StartWritingPayload,
  SubmitWritingPayload,
  WritingReview,
} from "@/modules/writing/types";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await parseJsonResponse<T | ApiErrorBody>(res);
  if (!res.ok) {
    throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
  }
  return body as T;
}

export const writingApi = {
  start(
    mockTestId: string,
    options?: {
      part?: number;
      forceNew?: boolean;
      mockAttemptId?: string;
    },
  ): Promise<StartWritingPayload> {
    const params = new URLSearchParams();
    params.set("part", String(options?.part ?? 1));
    if (options?.forceNew === true) params.set("force_new", "true");
    if (options?.mockAttemptId) {
      params.set("mock_attempt_id", options.mockAttemptId);
    }
    return call<StartWritingPayload>(
      `/api/writing/${encodeURIComponent(mockTestId)}/start?${params.toString()}`,
      { method: "POST" },
    );
  },

  autosave(
    attemptId: string,
    questionId: string,
    userAnswer: string,
  ) {
    return call<{ ok: boolean }>(
      `/api/writing/attempts/${encodeURIComponent(attemptId)}/autosave`,
      {
        method: "POST",
        body: JSON.stringify({
          question_id: questionId,
          user_answer: userAnswer,
        }),
      },
    );
  },

  submit(
    attemptId: string,
    answers: { question_id: string; user_answer: string }[],
  ): Promise<SubmitWritingPayload> {
    return call<SubmitWritingPayload>(
      `/api/writing/attempts/${encodeURIComponent(attemptId)}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      },
    );
  },

  review(attemptId: string): Promise<WritingReview> {
    return call<WritingReview>(
      `/api/writing/attempts/${encodeURIComponent(attemptId)}/review`,
    );
  },
};
