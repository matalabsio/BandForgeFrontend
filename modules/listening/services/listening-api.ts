import {
  ApiError,
  parseApiError,
  parseJsonResponse,
  type ApiErrorBody,
} from "@/lib/api";
import type {
  AutosavePayload,
  ListeningQuestionsPayload,
  ListeningScoreReport,
  StartListeningPayload,
  SubmitListeningPayload,
} from "@/modules/listening/types";

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
    return call<StartListeningPayload>(
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
    return call<ListeningQuestionsPayload>(
      `/api/listening/${encodeURIComponent(mockTestId)}/questions${qs}`,
      { method: "GET" },
    );
  },
  autosave(
    attemptId: string,
    questionId: string,
    userAnswer: string,
  ): Promise<AutosavePayload> {
    return call<AutosavePayload>(
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
    return call<SubmitListeningPayload>(
      `/api/listening/attempts/${encodeURIComponent(attemptId)}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      },
    );
  },
  scoreReport(attemptId: string): Promise<ListeningScoreReport> {
    return call<ListeningScoreReport>(
      `/api/listening/attempts/${encodeURIComponent(attemptId)}/score-report`,
      { method: "GET" },
    );
  },
};
