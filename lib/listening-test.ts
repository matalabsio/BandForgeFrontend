/** Published IELTS listening — Test 1 uses M01 part 1 only for orchestrated flow. */
import {
  DEFAULT_MOCK_SLUG,
  isFullMock,
  mockModulePath,
  test1HubPath,
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

export function listeningResultsPath(attemptId: string): string {
  return `/test/listening/results/${encodeURIComponent(attemptId)}`;
}

export function listeningModuleResultsPath(
  testId: string,
  attemptId: string,
): string {
  if (isListeningTest(testId)) {
    return listeningResultsPath(attemptId);
  }
  return `/mock/${encodeURIComponent(testId)}/listening/results/${encodeURIComponent(attemptId)}`;
}

