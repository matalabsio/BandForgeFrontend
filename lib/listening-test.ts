/** Published IELTS listening — Test 1 uses M01 part 1 only for orchestrated flow. */
import {
  DEFAULT_MOCK_SLUG,
  isFullMock,
  mockModulePath,
  shortModuleListeningResultsPath,
  shortModuleResultsPath,
  test1HubPath,
  testNumberForMockId,
} from "@/lib/mock-catalog";

export function isListeningTest(testId: string): boolean {
  return isFullMock(testId);
}

export function listeningTestPath(): string {
  return mockModulePath(DEFAULT_MOCK_SLUG, "listening", { part: 1 });
}

export function listeningTestHubPath(): string {
  return test1HubPath();
}

/** Short canonical results URL — pass attemptId when opening a specific attempt. */
export function listeningResultsPath(
  testNumber = 1,
  attemptId?: string,
  opts?: { mockAttemptId?: string | null; part?: number | null },
): string {
  if (attemptId) {
    return shortModuleListeningResultsPath(testNumber, attemptId, opts);
  }
  return shortModuleResultsPath(testNumber, "listening");
}

export function listeningModuleResultsPath(
  testId: string,
  attemptId: string,
  opts?: { mockAttemptId?: string | null; part?: number | null },
): string {
  if (isListeningTest(testId)) {
    return listeningResultsPath(testNumberForMockId(testId), attemptId, opts);
  }
  return `/mock/${encodeURIComponent(testId)}/listening/results`;
}
