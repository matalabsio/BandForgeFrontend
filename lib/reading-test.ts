/** Published IELTS reading — Test 1 uses M01 passage 1 only for orchestrated flow. */
import { DEFAULT_MOCK_SLUG, isFullMock, mockHubPath } from "@/lib/mock-catalog";

function isReadingTest(testId: string): boolean {
  return isFullMock(testId);
}

export function readingTestHubPath(): string {
  return mockHubPath(DEFAULT_MOCK_SLUG);
}

export function readingResultsPath(attemptId: string): string {
  return `/test/reading/results/${encodeURIComponent(attemptId)}`;
}

export function readingModuleResultsPath(
  testId: string,
  attemptId: string,
): string {
  if (isReadingTest(testId)) {
    return readingResultsPath(attemptId);
  }
  return `/mock/${encodeURIComponent(testId)}/reading/results/${encodeURIComponent(attemptId)}`;
}
