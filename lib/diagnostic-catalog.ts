import type { MockMeta } from "@/lib/mock-catalog";

/** Dedicated diagnostic mock — not in catalog hub. */
export const DIAGNOSTIC_MOCK_TEST_ID =
  "d0000000-0000-4000-8000-000000000001";

export const DIAGNOSTIC_MOCK_SLUG = "diagnostic";

/** SessionStorage nav scope for diagnostic exam flags (not a catalog test number). */
export const DIAGNOSTIC_NAV_TEST_NUMBER = 0;

export const DIAGNOSTIC_LISTENING_PART_COUNT = 1;
export const DIAGNOSTIC_READING_PASSAGE_COUNT = 1;
export const DIAGNOSTIC_WRITING_TASK_COUNT = 1;
export const DIAGNOSTIC_SPEAKING_PART_COUNT = 1;

/** Journey spec section timers (seconds). */
export const DIAGNOSTIC_LISTENING_TIMER_SEC = 10 * 60;
export const DIAGNOSTIC_LISTENING_PREP_SEC = 15;
export const DIAGNOSTIC_READING_TIMER_SEC = 15 * 60;
export const DIAGNOSTIC_WRITING_TIMER_SEC = 20 * 60;
export const DIAGNOSTIC_PROCESSING_SEC = 12;

export const diagnosticPaths = {
  landing: "/diagnostic",
  listeningPrep: "/diagnostic/listening/prep",
  listening: "/diagnostic/listening",
  /** Legacy bookmark only — redirects away; not part of the live journey. */
  listeningResults: "/diagnostic/listening/results",
  reading: "/diagnostic/reading",
  /** Legacy bookmark only — redirects away; not part of the live journey. */
  readingResults: "/diagnostic/reading/results",
  writing: "/diagnostic/writing",
  speaking: "/diagnostic/speaking",
  processing: "/diagnostic/processing",
  transition: "/diagnostic/transition",
  results: "/diagnostic/results",
  planReveal: "/diagnostic/results?checkout=1",
} as const;

export const DIAGNOSTIC_MOCK_META: MockMeta = {
  slug: DIAGNOSTIC_MOCK_SLUG,
  id: DIAGNOSTIC_MOCK_TEST_ID,
  displayLabel: "Free Diagnostic",
  subtitle: "Listening · Reading · Writing · Speaking",
  flowHint: "Free snapshot (~47 min)",
  listeningPartCount: DIAGNOSTIC_LISTENING_PART_COUNT,
  readingPassageCount: DIAGNOSTIC_READING_PASSAGE_COUNT,
  writingTaskCount: DIAGNOSTIC_WRITING_TASK_COUNT,
  listeningMinutes: 10,
  readingMinutes: 15,
  writingMinutes: 20,
  totalMinutes: 47,
};

export function isDiagnosticMockId(mockTestId: string): boolean {
  return mockTestId === DIAGNOSTIC_MOCK_TEST_ID;
}

export function isDiagnosticFlow(
  flow?: "mock" | "diagnostic",
  testId?: string,
): boolean {
  return flow === "diagnostic" || (testId != null && isDiagnosticMockId(testId));
}
