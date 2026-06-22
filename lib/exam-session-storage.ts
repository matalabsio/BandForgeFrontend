import { mockAttemptStorageKey } from "@/modules/mock/lib/mock-session-storage";

export type ResultModule = "listening" | "reading" | "writing";

export type ExamNavFlags = {
  auto?: boolean;
  sectionStart?: boolean;
};

function examNavFlagsKey(testNumber: number, module: ResultModule): string {
  return `bf-nav-${testNumber}-${module}`;
}

export function persistExamNavFlags(
  testNumber: number,
  module: ResultModule,
  flags: ExamNavFlags,
): void {
  if (typeof window === "undefined") return;
  if (!flags.auto && !flags.sectionStart) return;
  try {
    sessionStorage.setItem(
      examNavFlagsKey(testNumber, module),
      JSON.stringify(flags),
    );
  } catch {
    /* ignore */
  }
}

export function consumeExamNavFlags(
  testNumber: number,
  module: ResultModule,
): ExamNavFlags {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(examNavFlagsKey(testNumber, module));
    sessionStorage.removeItem(examNavFlagsKey(testNumber, module));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ExamNavFlags;
    return {
      auto: Boolean(parsed.auto),
      sectionStart: Boolean(parsed.sectionStart),
    };
  } catch {
    return {};
  }
}

export function peekExamNavFlags(
  testNumber: number,
  module: ResultModule,
): ExamNavFlags {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(examNavFlagsKey(testNumber, module));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ExamNavFlags;
    return {
      auto: Boolean(parsed.auto),
      sectionStart: Boolean(parsed.sectionStart),
    };
  } catch {
    return {};
  }
}

export function persistMockAttemptId(
  mockTestId: string,
  mockAttemptId: string,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(mockAttemptStorageKey(mockTestId), mockAttemptId);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readMockAttemptId(mockTestId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(mockAttemptStorageKey(mockTestId));
  } catch {
    return null;
  }
}

export function moduleResultStorageKey(
  testNumber: number,
  module: ResultModule,
): string {
  return `bf-result-${testNumber}-${module}`;
}

function activeModuleResultKey(module: ResultModule): string {
  return `bf-result-${module}-active`;
}

export function persistModuleResultAttempt(
  testNumber: number,
  module: ResultModule,
  attemptId: string,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      moduleResultStorageKey(testNumber, module),
      attemptId,
    );
    sessionStorage.setItem(activeModuleResultKey(module), attemptId);
  } catch {
    /* ignore */
  }
}

export function readModuleResultAttempt(
  testNumber: number,
  module: ResultModule,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      sessionStorage.getItem(moduleResultStorageKey(testNumber, module)) ??
      sessionStorage.getItem(activeModuleResultKey(module))
    );
  } catch {
    return null;
  }
}
