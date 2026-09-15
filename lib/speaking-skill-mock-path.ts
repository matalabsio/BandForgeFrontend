/**
 * Exam URL for the allotted Speaking Skill mock.
 * Uses skill_context=speaking so SpeakingPage skips full-mock orchestration
 * without impersonating Today's plan.
 */
import {
  isLiveCatalogTestNumber,
  mockModulePath,
  shortModuleExamPath,
  testNumberForMockId,
} from "@/lib/mock-catalog";

export function speakingSkillMockExamPath(
  mockTestId: string,
  part?: number | null,
): string {
  const testNumber = testNumberForMockId(mockTestId);
  if (isLiveCatalogTestNumber(testNumber)) {
    const base = shortModuleExamPath(testNumber, "speaking", {
      part: part ?? 1,
    });
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}skill_context=speaking`;
  }
  const base = mockModulePath(mockTestId, "speaking", {
    part: part ?? 1,
    testNumber,
  });
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}skill_context=speaking`;
}
