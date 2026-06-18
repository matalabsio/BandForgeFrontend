/** Published IELTS listening — Test 1 uses M01 part 1 only for orchestrated flow. */
import {
  DEFAULT_MOCK_SLUG,
  isFullMock,
  mockModulePath,
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

/** Short canonical results URL — persist attempt in sessionStorage before navigating. */
export function listeningResultsPath(testNumber = 1): string {
  return shortModuleResultsPath(testNumber, "listening");
}

export function listeningModuleResultsPath(
  testId: string,
  _attemptId: string,
): string {
  if (isListeningTest(testId)) {
    return listeningResultsPath(testNumberForMockId(testId));
  }
  return `/mock/${encodeURIComponent(testId)}/listening/results`;
}
