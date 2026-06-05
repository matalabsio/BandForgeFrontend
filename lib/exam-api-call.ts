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

const DEFAULT_TIMEOUT_MS = 15_000;

function examRequestHeaders(init?: RequestInit): HeadersInit {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (isAuthEnabled()) {
    const token = getAccessToken();
    // Never send an expired bearer — it overrides valid httpOnly cookie auth on the proxy.
    if (token && !accessTokenExpired(token)) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
}

/**
 * Browser exam API fetch via Next proxy routes.
 * Proactively refreshes stale access; on 401, refreshes once and retries.
 */
export async function examApiCall<T>(
  path: string,
  init?: RequestInit,
  options?: { timeoutMs?: number; retryOn401?: boolean },
): Promise<T> {
  const allowRetry = options?.retryOn401 !== false && isAuthEnabled();
  let retried = false;

  const run = async (): Promise<T> => {
    purgeExpiredAccessMirror();
    await ensureExamSessionIfStale();

    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );
    try {
      const res = await fetch(path, {
        ...init,
        credentials: "include",
        signal: controller.signal,
        headers: examRequestHeaders(init),
        cache: "no-store",
      });
      const body = await parseJsonResponse<T | ApiErrorBody>(res);
      if (!res.ok) {
        throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
      }
      return body as T;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        throw new ApiError("Request timed out. Please try again.", 408);
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await run();
  } catch (e) {
    if (e instanceof ExamSessionError) throw e;
    if (allowRetry && !retried && e instanceof ApiError && e.status === 401) {
      retried = true;
      await ensureExamSession();
      return await run();
    }
    throw e;
  }
}
