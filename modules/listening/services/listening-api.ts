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
  start(mockTestId: string): Promise<StartListeningPayload> {
    return call<StartListeningPayload>(
      `/api/listening/${encodeURIComponent(mockTestId)}/start`,
      { method: "POST" },
    );
  },
  questions(mockTestId: string): Promise<ListeningQuestionsPayload> {
    return call<ListeningQuestionsPayload>(
      `/api/listening/${encodeURIComponent(mockTestId)}/questions`,
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
