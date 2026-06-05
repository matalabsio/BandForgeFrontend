import { examApiCall } from "@/lib/exam-api-call";
import type {
  AutosavePayload,
  ListeningQuestionsPayload,
  ListeningScoreReport,
  StartListeningPayload,
  SubmitListeningPayload,
} from "@/modules/listening/types";

export const listeningApi = {
  start(
    mockTestId: string,
    options?: {
      forceNew?: boolean;
      part?: number;
      mockAttemptId?: string;
      includeQuestions?: boolean;
    },
  ): Promise<StartListeningPayload> {
    const params = new URLSearchParams();
    if (options?.forceNew === true) params.set("force_new", "true");
    if (options?.part) params.set("part", String(options.part));
    if (options?.mockAttemptId) {
      params.set("mock_attempt_id", options.mockAttemptId);
    }
    if (options?.includeQuestions !== false) {
      params.set("include_questions", "true");
    }
    const qs = params.toString() ? `?${params.toString()}` : "";
    return examApiCall<StartListeningPayload>(
      `/api/listening/${encodeURIComponent(mockTestId)}/start${qs}`,
      { method: "POST" },
    );
  },
  questions(
    mockTestId: string,
    options?: { part?: number },
  ): Promise<ListeningQuestionsPayload> {
    const params = new URLSearchParams();
    if (options?.part) params.set("part", String(options.part));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return examApiCall<ListeningQuestionsPayload>(
      `/api/listening/${encodeURIComponent(mockTestId)}/questions${qs}`,
      { method: "GET" },
    );
  },
  autosave(
    attemptId: string,
    questionId: string,
    userAnswer: string,
  ): Promise<AutosavePayload> {
    return examApiCall<AutosavePayload>(
      `/api/listening/attempts/${encodeURIComponent(attemptId)}/autosave`,
      {
        method: "POST",
        body: JSON.stringify({ question_id: questionId, user_answer: userAnswer }),
      },
    );
  },
  submit(
    attemptId: string,
    answers: { question_id: string; user_answer: string }[],
  ): Promise<SubmitListeningPayload> {
    return examApiCall<SubmitListeningPayload>(
      `/api/listening/attempts/${encodeURIComponent(attemptId)}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      },
    );
  },
  scoreReport(attemptId: string): Promise<ListeningScoreReport> {
    return examApiCall<ListeningScoreReport>(
      `/api/listening/attempts/${encodeURIComponent(attemptId)}/score-report`,
      { method: "GET" },
    );
  },
};
