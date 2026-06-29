import { examApiCall } from "@/lib/exam-api-call";
import type {
  StartWritingPayload,
  SubmitWritingPayload,
  WritingPendingPayload,
  WritingReview,
} from "@/modules/writing/types";

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
    return examApiCall<StartWritingPayload>(
      `/api/writing/${encodeURIComponent(mockTestId)}/start?${params.toString()}`,
      { method: "POST" },
    );
  },

  autosave(
    attemptId: string,
    questionId: string,
    userAnswer: string,
  ) {
    return examApiCall<{ ok: boolean }>(
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
    return examApiCall<SubmitWritingPayload>(
      `/api/writing/attempts/${encodeURIComponent(attemptId)}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      },
    );
  },

  review(attemptId: string): Promise<WritingReview> {
    return examApiCall<WritingReview>(
      `/api/writing/attempts/${encodeURIComponent(attemptId)}/review`,
    );
  },

  pending(attemptId: string): Promise<WritingPendingPayload> {
    return examApiCall<WritingPendingPayload>(
      `/api/writing/attempts/${encodeURIComponent(attemptId)}/pending`,
    );
  },
};
