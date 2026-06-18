/** Published IELTS reading — Test 1 uses M01 passage 1 only for orchestrated flow. */
import {
  isFullMock,
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

/** Short canonical results URL — persist attempt in sessionStorage before navigating. */
export function readingResultsPath(testNumber = 1): string {
  return shortModuleResultsPath(testNumber, "reading");
}

export function readingModuleResultsPath(
  testId: string,
  _attemptId: string,
): string {
  if (isReadingTest(testId)) {
    return readingResultsPath(testNumberForMockId(testId));
  }
  return `/mock/${encodeURIComponent(testId)}/reading/results`;
}
