import { ApiError } from "@/lib/api";

export const STUDY_PLAN_FETCH_MS = 60_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500 || error.status === 408 || error.status === 429;
  }
  if (error instanceof Error) {
    return error.name === "TypeError" || error.message.includes("fetch");
  }
  return false;
}

/** Retry client learning fetches on timeout / transient server errors. */
export async function fetchStudyPlanWithRetry<T>(
  fetcher: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS && isRetryableError(error)) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
