import {
  ApiError,
  parseApiError,
  parseJsonResponse,
  type ApiErrorBody,
} from "@/lib/api";
import {
  ensureExamSession,
  ensureExamSessionIfStale,
  ExamSessionError,
  purgeExpiredAccessMirror,
} from "@/lib/exam-session";
import { isAuthEnabled } from "@/lib/flags";
import { accessTokenExpired } from "@/lib/jwt-expiry";
import type { PracticeSkill } from "@/lib/practice-types";
import { getAccessToken } from "@/lib/session";
import { recordingFilenameForMime } from "@/modules/speaking/lib/media-recorder-support";
import {
  confirmSpeakingUploadBody,
  createSpeakingUploadBody,
  finalizeSpeakingBody,
} from "@/modules/speaking/lib/speaking-upload-contract";
import type {
  FinalizeSpeakingPayload,
  SpeakingNotificationPreferences,
  SpeakingNotificationPreferencesPatch,
  SpeakingPendingPayload,
  SpeakingReportPayload,
  SpeakingResponsesPayload,
  SpeakingResponseUploadSessionPayload,
  StartSpeakingPayload,
  SubmitSpeakingPayload,
  UploadSpeakingResponsePayload,
} from "@/modules/speaking/types";

const DEFAULT_TIMEOUT_MS = 15_000;
const SUBMIT_TIMEOUT_MS = 90_000;

function authHeaders(): Headers {
  const headers = new Headers();
  if (isAuthEnabled()) {
    const token = getAccessToken();
    if (token && !accessTokenExpired(token)) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
}

async function examMultipartCall<T>(
  path: string,
  formData: FormData,
  options?: { timeoutMs?: number },
): Promise<T> {
  purgeExpiredAccessMirror();
  await ensureExamSessionIfStale();

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options?.timeoutMs ?? SUBMIT_TIMEOUT_MS,
  );

  try {
    const res = await fetch(path, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: authHeaders(),
      signal: controller.signal,
      cache: "no-store",
    });
    const body = await parseJsonResponse<T | ApiErrorBody>(res);
    if (!res.ok) {
      throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
    }
    return body as T;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ApiError("Upload timed out. Please try again.", 408);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function examJsonCall<T>(
  path: string,
  init?: RequestInit,
  options?: { timeoutMs?: number; signal?: AbortSignal },
): Promise<T> {
  purgeExpiredAccessMirror();
  await ensureExamSessionIfStale();

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );
  const abortFromCaller = () => controller.abort();
  if (options?.signal?.aborted) {
    controller.abort();
  } else {
    options?.signal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  const headers = authHeaders();
  headers.set("Content-Type", "application/json");

  try {
    const res = await fetch(path, {
      ...init,
      credentials: "include",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    const body = await parseJsonResponse<T | ApiErrorBody>(res);
    if (!res.ok) {
      throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
    }
    return body as T;
  } catch (e) {
    if (e instanceof ExamSessionError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
      if (options?.signal?.aborted) throw e;
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    if (e instanceof ApiError && e.status === 401 && isAuthEnabled()) {
      await ensureExamSession();
      return examJsonCall<T>(path, init, { ...options, timeoutMs: options?.timeoutMs });
    }
    throw e;
  } finally {
    clearTimeout(timer);
    options?.signal?.removeEventListener("abort", abortFromCaller);
  }
}

export const speakingApi = {
  notificationPreferences(
    options?: { signal?: AbortSignal },
  ): Promise<SpeakingNotificationPreferences> {
    return examJsonCall<SpeakingNotificationPreferences>(
      "/api/speaking/notification-preferences",
      { method: "GET" },
      options,
    );
  },

  updateNotificationPreferences(
    input: SpeakingNotificationPreferencesPatch,
  ): Promise<SpeakingNotificationPreferences> {
    return examJsonCall<SpeakingNotificationPreferences>(
      "/api/speaking/notification-preferences",
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );
  },

  start(
    mockTestId: string,
    options?: {
      part?: number;
      forceNew?: boolean;
      mockAttemptId?: string;
      skillContext?: PracticeSkill;
      fromPlan?: boolean;
    },
  ): Promise<StartSpeakingPayload> {
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
    return examJsonCall<StartSpeakingPayload>(
      `/api/speaking/${encodeURIComponent(mockTestId)}/start?${params.toString()}`,
      { method: "POST" },
    );
  },

  submit(
    attemptId: string,
    audio: Blob,
    durationSec: number,
  ): Promise<SubmitSpeakingPayload> {
    const formData = new FormData();
    const filename = recordingFilenameForMime(audio.type);
    formData.append("file", audio, filename);
    formData.append("duration_sec", String(durationSec));
    return examMultipartCall<SubmitSpeakingPayload>(
      `/api/speaking/attempts/${encodeURIComponent(attemptId)}/submit`,
      formData,
    );
  },

  responses(attemptId: string): Promise<SpeakingResponsesPayload> {
    return examJsonCall<SpeakingResponsesPayload>(
      `/api/speaking/attempts/${encodeURIComponent(attemptId)}/responses`,
      { method: "GET" },
    );
  },

  uploadResponse(
    attemptId: string,
    input: {
      questionId: string;
      part: 1 | 2 | 3;
      sequence: number;
      audio: Blob;
      durationSec: number;
    },
  ): Promise<UploadSpeakingResponsePayload> {
    const formData = new FormData();
    formData.append("file", input.audio, recordingFilenameForMime(input.audio.type));
    formData.append("question_id", input.questionId);
    formData.append("part", String(input.part));
    formData.append("sequence_number", String(input.sequence));
    formData.append("duration_sec", String(input.durationSec));
    return examMultipartCall<UploadSpeakingResponsePayload>(
      `/api/speaking/attempts/${encodeURIComponent(attemptId)}/responses`,
      formData,
    );
  },

  createResponseUploadSession(
    attemptId: string,
    input: {
      questionId: string;
      part: 1 | 2 | 3;
      sequence: number;
      durationSec: number;
      contentType: string;
      contentLength: number;
      idempotencyKey: string;
    },
  ): Promise<SpeakingResponseUploadSessionPayload> {
    return examJsonCall<SpeakingResponseUploadSessionPayload>(
      `/api/speaking/attempts/${encodeURIComponent(attemptId)}/response-sessions`,
      {
        method: "POST",
        body: JSON.stringify(createSpeakingUploadBody(input)),
      },
    );
  },

  async putSignedResponse(
    uploadUrl: string,
    audio: Blob,
    suppliedHeaders?: Record<string, string>,
  ): Promise<void> {
    const headers = new Headers(suppliedHeaders);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", audio.type || "application/octet-stream");
    }
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers,
      body: audio,
      signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new ApiError(`Audio upload failed (${response.status}).`, response.status);
    }
  },

  confirmResponseUpload(
    attemptId: string,
    responseId: string,
    input: { idempotencyKey: string; durationSec: number },
  ): Promise<UploadSpeakingResponsePayload> {
    return examJsonCall<UploadSpeakingResponsePayload>(
      `/api/speaking/attempts/${encodeURIComponent(attemptId)}/responses/${encodeURIComponent(responseId)}/confirm`,
      {
        method: "POST",
        body: JSON.stringify(confirmSpeakingUploadBody(input)),
      },
    );
  },

  finalize(
    attemptId: string,
    input: { manifestHash: string },
  ): Promise<FinalizeSpeakingPayload> {
    return examJsonCall<FinalizeSpeakingPayload>(
      `/api/speaking/attempts/${encodeURIComponent(attemptId)}/finalize`,
      {
        method: "POST",
        body: JSON.stringify(finalizeSpeakingBody(input.manifestHash)),
      },
      { timeoutMs: SUBMIT_TIMEOUT_MS },
    );
  },

  pending(
    attemptId: string,
    options?: { signal?: AbortSignal },
  ): Promise<SpeakingPendingPayload> {
    return examJsonCall<SpeakingPendingPayload>(
      `/api/speaking/attempts/${encodeURIComponent(attemptId)}/pending`,
      { method: "GET" },
      options,
    );
  },

  report(attemptId: string): Promise<SpeakingReportPayload> {
    return examJsonCall<SpeakingReportPayload>(
      `/api/speaking/attempts/${encodeURIComponent(attemptId)}/report`,
      { method: "GET" },
    );
  },
};
