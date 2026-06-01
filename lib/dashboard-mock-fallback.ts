import type { MockTestSummary } from "@/components/bandforge/dashboard/types";
import { M01_MOCK_TEST_ID, MOCK_DISPLAY_LABEL } from "@/lib/mock-catalog";

/** Shown when /api/tests/mock-tests is empty or unavailable (e.g. migrations pending). */
export const M01_MOCK_FALLBACK: MockTestSummary = {
  id: M01_MOCK_TEST_ID,
  title: MOCK_DISPLAY_LABEL,
  description:
    "Reading (13 questions) → Listening (4 parts, 40 questions). Writing and Speaking coming soon.",
  listening_question_count: 40,
  listening_duration_minutes: 30,
  reading_question_count: 13,
  reading_duration_minutes: 20,
};

export function resolveDashboardMockTests(
  fromApi: MockTestSummary[],
): MockTestSummary[] {
  if (fromApi.length > 0) return fromApi;
  return [M01_MOCK_FALLBACK];
}
