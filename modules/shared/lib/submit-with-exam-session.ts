import { ApiError } from "@/lib/api";
import {
  ensureExamSessionForSubmit,
  EXAM_SESSION_EXPIRED_MESSAGE,
  ExamSessionError,
} from "@/lib/exam-session";

export function formatExamSubmitError(e: unknown): string {
  if (e instanceof ExamSessionError) return e.message;
  if (e instanceof ApiError) {
    if (e.status === 401) return EXAM_SESSION_EXPIRED_MESSAGE;
    return e.message;
  }
  if (e instanceof Error && e.name === "AbortError") {
    return "Request timed out. If your answers already uploaded, open results or try submit again.";
  }
  if (e instanceof Error && e.message.trim()) return e.message;
  return "Submit failed.";
}

type SubmitWithExamSessionOptions<T> = {
  flush?: () => void | Promise<void>;
  submit: () => Promise<T>;
};

/**
 * Flush pending saves, ensure auth, then submit.
 * Throws ExamSessionError or ApiError on failure.
 */
export async function submitWithExamSession<T>(
  options: SubmitWithExamSessionOptions<T>,
): Promise<T> {
  if (options.flush) {
    await Promise.resolve(options.flush());
  }
  await ensureExamSessionForSubmit();
  try {
    return await options.submit();
  } catch (e) {
    if (e instanceof ExamSessionError) throw e;
    if (e instanceof ApiError && e.status === 401) {
      throw new ExamSessionError();
    }
    throw e;
  }
}
