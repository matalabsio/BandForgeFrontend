import type { MockAttemptProgress, StartMockResponse } from "@/modules/mock/services/mock-api";
import {
  examPathForMockStart,
  examRedirectIfMismatch,
  mockPathFromProgress,
} from "@/lib/mock-catalog";

export function navigateAfterMockStart(
  router: { push: (url: string) => void; replace: (url: string) => void },
  slug: string,
  res: StartMockResponse,
  opts?: { replace?: boolean },
) {
  const path = examPathForMockStart(slug, res);
  if (opts?.replace) router.replace(path);
  else router.push(path);
}

export function navigateFromProgress(
  router: { replace: (url: string) => void },
  slug: string,
  mockAttemptId: string,
  progress: Pick<
    MockAttemptProgress,
    "status" | "next_module" | "next_part"
  >,
  attemptId?: string,
) {
  router.replace(
    mockPathFromProgress(slug, mockAttemptId, progress, attemptId),
  );
}

export function syncExamRoute(
  router: { replace: (url: string) => void },
  slug: string,
  mockAttemptId: string,
  current: { module: "reading" | "listening" | "writing"; part: number },
  progress: Pick<
    MockAttemptProgress,
    "status" | "next_module" | "next_part"
  >,
): boolean {
  const redirect = examRedirectIfMismatch(slug, mockAttemptId, current, progress);
  if (redirect) {
    router.replace(redirect);
    return true;
  }
  return false;
}
