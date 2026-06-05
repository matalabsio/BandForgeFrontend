import { examApiCall } from "@/lib/exam-api-call";
import type {
  ReadingQuestionsPayload,
  ReadingScoreReport,
  StartReadingPayload,
  SubmitReadingPayload,
} from "@/modules/reading/types";

export const readingApi = {
  start(
    mockTestId: string,
    options?: {
      forceNew?: boolean;
      part?: number;
      mockAttemptId?: string;
    },
  ): Promise<StartReadingPayload> {
    const params = new URLSearchParams();
    params.set("include_questions", "true");
    if (options?.forceNew === true) params.set("force_new", "true");
    if (options?.part) params.set("passage", String(options.part));
    if (options?.mockAttemptId) {
      params.set("mock_attempt_id", options.mockAttemptId);
    }
    const qs = `?${params.toString()}`;
    return examApiCall<StartReadingPayload>(
      `/api/reading/${encodeURIComponent(mockTestId)}/start${qs}`,
      { method: "POST" },
    );
  },
  questions(
    mockTestId: string,
    options?: { part?: number },
  ): Promise<ReadingQuestionsPayload> {
    const params = new URLSearchParams();
    if (options?.part) params.set("passage", String(options.part));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return examApiCall<ReadingQuestionsPayload>(
      `/api/reading/${encodeURIComponent(mockTestId)}/questions${qs}`,
      { method: "GET" },
    );
  },
  autosave(
    attemptId: string,
    questionId: string,
    userAnswer: string,
  ): Promise<{ ok: boolean }> {
    return examApiCall(
      `/api/reading/attempts/${encodeURIComponent(attemptId)}/autosave`,
      {
        method: "POST",
        body: JSON.stringify({ question_id: questionId, user_answer: userAnswer }),
      },
    );
  },
  submit(
    attemptId: string,
    answers: { question_id: string; user_answer: string }[],
  ): Promise<SubmitReadingPayload> {
    return examApiCall<SubmitReadingPayload>(
      `/api/reading/attempts/${encodeURIComponent(attemptId)}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      },
    );
  },
  scoreReport(attemptId: string): Promise<ReadingScoreReport> {
    return examApiCall<ReadingScoreReport>(
      `/api/reading/attempts/${encodeURIComponent(attemptId)}/score-report`,
      { method: "GET" },
    );
  },
};
