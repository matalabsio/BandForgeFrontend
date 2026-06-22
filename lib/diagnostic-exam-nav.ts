import type { ResultModule } from "@/lib/exam-session-storage";
import { persistExamNavFlags, persistMockAttemptId } from "@/lib/exam-session-storage";
import {
  DIAGNOSTIC_MOCK_TEST_ID,
  DIAGNOSTIC_NAV_TEST_NUMBER,
  diagnosticPaths,
} from "@/lib/diagnostic-catalog";
import { persistDiagnosticAttemptId } from "@/lib/diagnostic-session";
import type { StartMockResponse } from "@/modules/mock/services/mock-api";

type Router = {
  replace: (url: string) => void;
  push?: (url: string) => void;
};

export function diagnosticModulePath(
  module: ResultModule,
  opts?: { part?: number; passage?: number },
): string {
  if (module === "listening") return diagnosticPaths.listening;
  if (module === "reading") return diagnosticPaths.reading;
  if (module === "writing") {
    const part = opts?.part ?? 1;
    return part === 1
      ? diagnosticPaths.writing
      : `${diagnosticPaths.writing}?part=${part}`;
  }
  return diagnosticPaths.landing;
}

export function navigateToDiagnosticPath(
  router: Router,
  path: string,
  opts?: {
    replace?: boolean;
    mockAttemptId?: string;
    auto?: boolean;
    sectionStart?: boolean;
    module?: ResultModule;
  },
) {
  if (opts?.mockAttemptId) {
    persistMockAttemptId(DIAGNOSTIC_MOCK_TEST_ID, opts.mockAttemptId);
    persistDiagnosticAttemptId(opts.mockAttemptId);
  }
  if (opts?.module && (opts.auto || opts.sectionStart)) {
    persistExamNavFlags(DIAGNOSTIC_NAV_TEST_NUMBER, opts.module, {
      auto: opts.auto,
      sectionStart: opts.sectionStart,
    });
  }
  if (opts?.replace) router.replace(path);
  else if (router.push) router.push(path);
  else router.replace(path);
}

export function navigateAfterDiagnosticStart(
  router: Router,
  res: StartMockResponse,
  opts?: { replace?: boolean },
) {
  if (res.mock_attempt_id) {
    persistMockAttemptId(DIAGNOSTIC_MOCK_TEST_ID, res.mock_attempt_id);
    persistDiagnosticAttemptId(res.mock_attempt_id);
  }
  navigateToDiagnosticPath(router, diagnosticPaths.listening, {
    replace: opts?.replace ?? true,
    mockAttemptId: res.mock_attempt_id,
    auto: true,
    sectionStart: true,
    module: "listening",
  });
}

export function diagnosticAfterListeningSubmit(): string {
  return diagnosticPaths.reading;
}

export function diagnosticAfterReadingSubmit(): string {
  return diagnosticPaths.writing;
}

export function diagnosticAfterWritingSubmit(): string {
  return diagnosticPaths.results;
}

export function navigateAfterDiagnosticSectionSubmit(
  router: Router,
  mockAttemptId: string,
  path: string,
  module: ResultModule,
) {
  navigateToDiagnosticPath(router, path, {
    replace: true,
    mockAttemptId,
    auto: true,
    sectionStart: true,
    module,
  });
}
