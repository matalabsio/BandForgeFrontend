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
  testNumberForMockId,
} from "@/lib/mock-catalog";
import { isMockFreeModuleAccess } from "@/modules/mock/lib/mock-progress";

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
    testNumber?: number;
  },
): void {
  const mockTestId = mockApiId(slug);
  if (opts?.mockAttemptId) {
    persistMockAttemptId(mockTestId, opts.mockAttemptId);
  }
  const testNumber = opts?.testNumber ?? testNumberForMockId(mockTestId);
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
  opts: {
    mockTestId: string;
    part?: number;
    passage?: number;
    auto?: boolean;
    sectionStart?: boolean;
    mockAttemptId?: string;
    replace?: boolean;
  },
) {
  const path = shortModuleExamPath(testNumber, module, {
    part: opts.part,
    passage: opts.passage,
  });
  navigateToExamPath(router, opts.mockTestId, path, {
    replace: opts.replace,
    mockAttemptId: opts.mockAttemptId,
    auto: opts.auto,
    sectionStart: opts.sectionStart,
    testNumber,
  });
}

function moduleFromExamPath(path: string): ResultModule | null {
  const match = path.match(/^\/test\/\d+\/(listening|reading|writing|speaking)/);
  return (match?.[1] as ResultModule | undefined) ?? null;
}

function testNumberFromExamPath(path: string): number | null {
  const match = path.match(/^\/test\/(\d+)\//);
  if (!match?.[1]) return null;
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
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
    testNumber?: number;
  },
) {
  const mockTestId = mockApiId(slug);
  const testNumber =
    opts?.testNumber ??
    testNumberFromExamPath(path) ??
    testNumberForMockId(mockTestId);
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
  opts?: { replace?: boolean; testNumber?: number },
) {
  if (res.progress?.mock_attempt_id && res.progress.next_module) {
    navigateFromProgress(
      router,
      slug,
      res.progress.mock_attempt_id,
      res.progress,
      undefined,
      { testNumber: opts?.testNumber },
    );
    return;
  }
  const path = examPathForMockStart(slug, res, { testNumber: opts?.testNumber });
  navigateToExamPath(router, slug, path, {
    replace: opts?.replace,
    mockAttemptId: res.mock_attempt_id,
    auto: true,
    sectionStart: true,
    testNumber: opts?.testNumber,
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
  opts?: { testNumber?: number },
) {
  navigateToExamPath(
    router,
    slug,
    mockPathFromProgress(slug, mockAttemptId, progress, attemptId, opts),
    {
      replace: true,
      mockAttemptId,
      auto: true,
      sectionStart: true,
      testNumber: opts?.testNumber,
    },
  );
}

export function syncExamRoute(
  router: Router,
  slug: string,
  mockAttemptId: string,
  current: { module: "reading" | "listening" | "writing" | "speaking"; part: number },
  progress: Pick<
    MockAttemptProgress,
    "status" | "next_module" | "next_part"
  >,
  opts?: { testNumber?: number },
): boolean {
  // Free-access testing: allow opening any module from hub cards without
  // forcing the sequential next_module path. Still bounce completed mocks
  // to the band report.
  if (isMockFreeModuleAccess()) {
    if (progress.status === "completed") {
      navigateToExamPath(
        router,
        slug,
        mockPathFromProgress(slug, mockAttemptId, progress, undefined, opts),
        {
          replace: true,
          mockAttemptId,
          testNumber: opts?.testNumber,
        },
      );
      return true;
    }
    return false;
  }
  const redirect = examRedirectIfMismatch(
    slug,
    mockAttemptId,
    current,
    progress,
    opts,
  );
  if (redirect) {
    navigateToExamPath(router, slug, redirect, {
      replace: true,
      mockAttemptId,
      auto: true,
      sectionStart: true,
      testNumber: opts?.testNumber,
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
