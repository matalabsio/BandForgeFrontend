import type {
  MockAttemptSummary,
  MockModuleResultSource,
  SectionScore,
} from "@/modules/mock/services/mock-api";
import { shortSectionResultsPath } from "@/lib/section-results-path";
import { testNumberForMockId } from "@/lib/mock-catalog";

export type MockResultModule =
  | "listening"
  | "reading"
  | "writing"
  | "speaking";

const RESULT_MODULES: MockResultModule[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

export function hasPendingMockResults(summary: MockAttemptSummary): boolean {
  if (summary.has_pending_reviews || summary.aggregate_is_provisional) return true;
  return Object.values(summary.module_result_states).some(
    ({ source }) =>
      source === "ai_estimate" ||
      source === "processing" ||
      source === "awaiting_examiner",
  );
}

export function shouldPollMockResults(
  summary: MockAttemptSummary,
  visibilityState: DocumentVisibilityState,
): boolean {
  return visibilityState !== "hidden" && hasPendingMockResults(summary);
}

export function moduleResultStatusLabel(
  source: MockModuleResultSource,
  module: MockResultModule,
): string {
  switch (source) {
    case "final":
      return module === "writing" || module === "speaking"
        ? "Human reviewed"
        : "Final score";
    case "ai_estimate":
      return "AI estimate";
    case "processing":
      return "Processing";
    case "failed":
      return "Evaluation failed";
    case "awaiting_examiner":
      return "Awaiting human review";
    case "unavailable":
      return "Unavailable";
  }
}

export function overallResultPresentation(summary: MockAttemptSummary): {
  band: number | null;
  label: string;
  description: string;
  official: boolean;
} {
  const pending = hasPendingMockResults(summary);
  const allModulesFinal = RESULT_MODULES.every(
    (module) => summary.module_result_states[module]?.source === "final",
  );
  const official = !pending && allModulesFinal;
  if (official) {
    return {
      band: summary.aggregate_band,
      label: "Official overall band",
      description: "Final average of all four module results.",
      official: true,
    };
  }
  if (pending) {
    return {
      band: summary.provisional_aggregate_band,
      label: "Provisional overall band",
      description:
        "Includes AI estimates and may change after pending human reviews.",
      official: false,
    };
  }
  return {
    band: null,
    label: "Overall band unavailable",
    description:
      "An overall band cannot be calculated from the available results.",
    official: false,
  };
}

function pickModuleSection(
  summary: MockAttemptSummary,
  module: MockResultModule,
): SectionScore | null {
  const sections = summary.sections.filter((s) => s.module === module);
  if (sections.length === 0) return null;
  return [...sections].toSorted((a, b) => (b.part ?? 0) - (a.part ?? 0))[0] ?? null;
}

/**
 * Deep-link from overall mock results → per-module score / AI result page.
 */
export function moduleSectionResultsHref(
  mockTestId: string,
  mockAttemptId: string,
  module: MockResultModule,
  summary: MockAttemptSummary,
): string | null {
  const testNumber = testNumberForMockId(mockTestId);
  const section = pickModuleSection(summary, module);
  const mod = summary.modules.find((m) => m.module === module);
  const attemptId =
    section?.test_attempt_id?.trim() || mod?.test_attempt_id?.trim() || null;
  if (!attemptId) return null;

  const part = section?.part ?? mod?.part ?? undefined;
  return shortSectionResultsPath(testNumber, module, {
    attempt: attemptId,
    part: part ?? undefined,
    mockAttempt: mockAttemptId,
  });
}
