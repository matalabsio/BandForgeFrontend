import type { ResultModule } from "@/lib/exam-session-storage";
import {
  persistExamNavFlags,
  persistMockAttemptId,
} from "@/lib/exam-session-storage";
import type { MockAttemptProgress, StartMockResponse } from "@/modules/mock/services/mock-api";
import {
  examPathForMockStart,
  examRedirectIfMismatch,
  mockApiId,
  mockPathFromProgress,
  shortModuleExamPath,
  mockTestIdForNumber,
  testNumberForMockId,
} from "@/lib/mock-catalog";

type Router = {
  replace: (url: string) => void;
  push?: (url: string) => void;
};

/** Persist transient nav state before a plain Link navigation. */
export function prepareExamModuleNavigation(
  slug: string,
  module: ResultModule,
  opts?: {
    auto?: boolean;
    sectionStart?: boolean;
    mockAttemptId?: string;
  },
): void {
  const mockTestId = mockApiId(slug);
  if (opts?.mockAttemptId) {
    persistMockAttemptId(mockTestId, opts.mockAttemptId);
  }
  const testNumber = testNumberForMockId(mockTestId);
  if (opts?.auto || opts?.sectionStart) {
    persistExamNavFlags(testNumber, module, {
      auto: opts.auto,
      sectionStart: opts.sectionStart,
    });
  }
}

export function navigateToModuleExam(
  router: Router,
  testNumber: number,
  module: ResultModule,
  opts?: {
    part?: number;
    passage?: number;
    auto?: boolean;
    sectionStart?: boolean;
    mockAttemptId?: string;
    replace?: boolean;
  },
) {
  const slug = mockTestIdForNumber(testNumber);
  const path = shortModuleExamPath(testNumber, module, {
    part: opts?.part,
    passage: opts?.passage,
  });
  navigateToExamPath(router, slug, path, opts);
}


function moduleFromExamPath(path: string): ResultModule | null {
  const match = path.match(/^\/test\/\d+\/(listening|reading|writing)/);
  return (match?.[1] as ResultModule | undefined) ?? null;
}

export function navigateToExamPath(
  router: Router,
  slug: string,
  path: string,
  opts?: {
    replace?: boolean;
    mockAttemptId?: string;
    auto?: boolean;
    sectionStart?: boolean;
  },
) {
  const mockTestId = mockApiId(slug);
  const testNumber = testNumberForMockId(mockTestId);
  if (opts?.mockAttemptId) {
    persistMockAttemptId(mockTestId, opts.mockAttemptId);
  }
  const module = moduleFromExamPath(path);
  if (module && (opts?.auto || opts?.sectionStart)) {
    persistExamNavFlags(testNumber, module, {
      auto: opts.auto,
      sectionStart: opts.sectionStart,
    });
  }
  if (opts?.replace) router.replace(path);
  else if (router.push) router.push(path);
  else router.replace(path);
}

export function navigateAfterMockStart(
  router: Router,
  slug: string,
  res: StartMockResponse & { progress?: MockAttemptProgress | null },
  opts?: { replace?: boolean },
) {
  if (res.progress?.mock_attempt_id && res.progress.next_module) {
    navigateFromProgress(
      router,
      slug,
      res.progress.mock_attempt_id,
      res.progress,
    );
    return;
  }
  const path = examPathForMockStart(slug, res);
  navigateToExamPath(router, slug, path, {
    replace: opts?.replace,
    mockAttemptId: res.mock_attempt_id,
    auto: true,
    sectionStart: true,
  });
}

export function navigateFromProgress(
  router: Router,
  slug: string,
  mockAttemptId: string,
  progress: Pick<
    MockAttemptProgress,
    "status" | "next_module" | "next_part"
  >,
  attemptId?: string,
) {
  navigateToExamPath(
    router,
    slug,
    mockPathFromProgress(slug, mockAttemptId, progress, attemptId),
    {
      replace: true,
      mockAttemptId,
      auto: true,
      sectionStart: true,
    },
  );
}

export function syncExamRoute(
  router: Router,
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
    navigateToExamPath(router, slug, redirect, {
      replace: true,
      mockAttemptId,
      auto: true,
      sectionStart: true,
    });
    return true;
  }
  return false;
}

/** After section submit — persist nav flags then navigate. */
export function navigateAfterSectionSubmit(
  router: Router,
  slug: string,
  mockAttemptId: string,
  path: string,
  opts?: { replace?: boolean },
) {
  navigateToExamPath(router, slug, path, {
    replace: opts?.replace,
    mockAttemptId,
    auto: true,
    sectionStart: true,
  });
}
