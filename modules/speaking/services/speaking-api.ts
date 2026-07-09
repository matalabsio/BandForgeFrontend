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
import { getAccessToken } from "@/lib/session";
import { recordingFilenameForMime } from "@/modules/speaking/lib/media-recorder-support";
import type {
  SpeakingPendingPayload,
  StartSpeakingPayload,
  SubmitSpeakingPayload,
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
  options?: { timeoutMs?: number },
): Promise<T> {
  purgeExpiredAccessMirror();
  await ensureExamSessionIfStale();

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

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
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    if (e instanceof ApiError && e.status === 401 && isAuthEnabled()) {
      await ensureExamSession();
      return examJsonCall<T>(path, init, { ...options, timeoutMs: options?.timeoutMs });
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export const speakingApi = {
  start(
    mockTestId: string,
    options?: {
      part?: number;
      forceNew?: boolean;
      mockAttemptId?: string;
    },
  ): Promise<StartSpeakingPayload> {
    const params = new URLSearchParams();
    params.set("part", String(options?.part ?? 1));
    if (options?.forceNew === true) params.set("force_new", "true");
    if (options?.mockAttemptId) {
      params.set("mock_attempt_id", options.mockAttemptId);
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

  pending(attemptId: string): Promise<SpeakingPendingPayload> {
    return examJsonCall<SpeakingPendingPayload>(
      `/api/speaking/attempts/${encodeURIComponent(attemptId)}/pending`,
      { method: "GET" },
    );
  },
};
