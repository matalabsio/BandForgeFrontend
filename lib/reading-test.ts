/** Published IELTS reading — Test 1 uses M01 passage 1 only for orchestrated flow. */
import {
  isFullMock,
  shortModuleReadingResultsPath,
  shortModuleResultsPath,
  test1HubPath,
  testNumberForMockId,
} from "@/lib/mock-catalog";

function isReadingTest(testId: string): boolean {
  return isFullMock(testId);
}

export function readingTestHubPath(): string {
  return test1HubPath();
}

/** Short canonical results URL — pass attemptId when opening a specific attempt. */
export function readingResultsPath(
  testNumber = 1,
  attemptId?: string,
  opts?: { mockAttemptId?: string | null; part?: number | null },
): string {
  if (attemptId) {
    return shortModuleReadingResultsPath(testNumber, attemptId, opts);
  }
  return shortModuleResultsPath(testNumber, "reading");
}

export function readingModuleResultsPath(
  testId: string,
  attemptId: string,
  opts?: { mockAttemptId?: string | null; part?: number | null },
): string {
  if (isReadingTest(testId)) {
    return readingResultsPath(testNumberForMockId(testId), attemptId, opts);
  }
  return `/mock/${encodeURIComponent(testId)}/reading/results`;
}
