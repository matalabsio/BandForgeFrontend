import { mockAttemptStorageKey } from "@/modules/mock/lib/mock-session-storage";

export type ResultModule = "listening" | "reading" | "writing";

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
