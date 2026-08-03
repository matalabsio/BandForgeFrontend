import { examApiCall } from "@/lib/exam-api-call";
import type { PracticeSkill } from "@/lib/practice-types";
import type {
  StartWritingPayload,
  SubmitWritingPayload,
  WritingPendingPayload,
  WritingReview,
} from "@/modules/writing/types";

type StartOptions = {
  part?: number;
  forceNew?: boolean;
  mockAttemptId?: string;
  skillContext?: PracticeSkill;
  fromPlan?: boolean;
};

/** Dedupes React Strict Mode double-mount POST /writing/.../start. */
const inflightWritingStarts = new Map<string, Promise<StartWritingPayload>>();

function writingStartKey(mockTestId: string, options?: StartOptions): string {
  return [
    mockTestId,
    options?.part ?? 1,
    options?.mockAttemptId ?? "",
    options?.fromPlan ? "1" : "0",
    options?.forceNew ? "1" : "0",
    options?.skillContext ?? "",
  ].join("|");
}

export const writingApi = {
  start(
    mockTestId: string,
    options?: StartOptions,
  ): Promise<StartWritingPayload> {
    const key = writingStartKey(mockTestId, options);
    const existing = inflightWritingStarts.get(key);
    if (existing) return existing;

    const params = new URLSearchParams();
    params.set("part", String(options?.part ?? 1));
    if (options?.forceNew === true) params.set("force_new", "true");
    if (options?.mockAttemptId) {
      params.set("mock_attempt_id", options.mockAttemptId);
    }
    if (options?.skillContext) {
      params.set("skill_context", options.skillContext);
    }
    if (options?.fromPlan) {
      params.set("from_plan", "true");
    }
    const pending = examApiCall<StartWritingPayload>(
      `/api/writing/${encodeURIComponent(mockTestId)}/start?${params.toString()}`,
      { method: "POST" },
    ).finally(() => {
      inflightWritingStarts.delete(key);
    });
    inflightWritingStarts.set(key, pending);
    return pending;
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
