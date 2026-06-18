import {
  DEFAULT_MOCK_SLUG,
  M01_MOCK_TEST_ID,
  isFullMock,
  mockModulePath,
  shortModuleResultsPath,
  test1HubPath,
  testNumberForMockId,
} from "@/lib/mock-catalog";

export { M01_MOCK_TEST_ID };

export function isWritingTest(testId: string): boolean {
  return isFullMock(testId);
}

export function writingTestHubPath(): string {
  return "/test/writing";
}

export function writingTaskPath(
  part: number,
  opts?: { mockSlug?: string; mockAttemptId?: string; auto?: boolean },
): string {
  if (opts?.mockSlug || opts?.mockAttemptId) {
    return mockModulePath(opts?.mockSlug ?? DEFAULT_MOCK_SLUG, "writing", {
      part,
      auto: opts?.auto,
    });
  }
  const params = new URLSearchParams();
  if (opts?.auto) params.set("auto", "1");
  const q = params.toString();
  const base = `/test/writing/task/${part}`;
  return q ? `${base}?${q}` : base;
}

/** Short canonical results URL — persist attempt in sessionStorage before navigating. */
export function writingResultsPath(testNumber = 1): string {
  return shortModuleResultsPath(testNumber, "writing");
}

export function writingModuleResultsPath(
  testId: string,
  _attemptId: string,
  mockSlug = DEFAULT_MOCK_SLUG,
): string {
  if (isWritingTest(testId)) {
    return writingResultsPath(testNumberForMockId(testId));
  }
  return `/mock/${encodeURIComponent(mockSlug)}/writing/results`;
}

export function writingMockHubPath(_mockAttemptId?: string): string {
  return test1HubPath();
}

/** IELTS minimum word counts per task (mirrors backend WRITING_MIN_WORDS). */
export const WRITING_MIN_WORDS: Record<number, number> = { 1: 150, 2: 250 };

export function writingMinWords(part: number): number {
  return WRITING_MIN_WORDS[part] ?? WRITING_MIN_WORDS[2];
}

/**
 * Client-side band estimate from word count (mirrors backend evaluation).
 * At/above the minimum: 7.8 rising to 8.3 (≥ minimum + 100 words).
 * Below the minimum: scaled down from 7.8 toward 3.0. Empty: 0.
 */
export function estimateWritingBand(words: number, part: number): number {
  if (words <= 0) return 0;
  const minimum = writingMinWords(part);
  if (words >= minimum) {
    const over = words - minimum;
    const bonus = Math.min(0.5, (over / 100) * 0.5);
    return Math.round((7.8 + bonus) * 10) / 10;
  }
  const ratio = words / minimum;
  return Math.round((3.0 + ratio * (7.8 - 3.0)) * 10) / 10;
}
