export type ReadingExamPhase = "intro" | "passage" | "questions";

export type QuestionSectionId =
  | "tfng"
  | "matching_headings"
  | "sentence_completion";

export const QUESTION_SECTION_ORDER: QuestionSectionId[] = [
  "tfng",
  "matching_headings",
  "sentence_completion",
];

export type ReadingFlowSnapshot = {
  attemptId?: string;
  passage: number;
  examPhase: ReadingExamPhase;
  questionSection: QuestionSectionId;
  answers?: Record<string, string>;
};

const FLOW_PREFIX = "bf-reading-flow-";

export function flowStorageKey(
  testId: string,
  passage: number,
  mockAttemptId: string | null,
): string {
  return `${FLOW_PREFIX}${testId}-p${passage}-${mockAttemptId ?? "solo"}`;
}

export function readFlowSnapshot(
  testId: string,
  passage: number,
  mockAttemptId: string | null,
): ReadingFlowSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(flowStorageKey(testId, passage, mockAttemptId));
    if (!raw) return null;
    return JSON.parse(raw) as ReadingFlowSnapshot;
  } catch {
    return null;
  }
}

export function writeFlowSnapshot(
  testId: string,
  passage: number,
  mockAttemptId: string | null,
  snapshot: ReadingFlowSnapshot,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      flowStorageKey(testId, passage, mockAttemptId),
      JSON.stringify(snapshot),
    );
  } catch {
    /* ignore */
  }
}

export function clearFlowSnapshot(
  testId: string,
  passage: number,
  mockAttemptId: string | null,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(flowStorageKey(testId, passage, mockAttemptId));
  } catch {
    /* ignore */
  }
}

export function nextSection(
  current: QuestionSectionId,
): QuestionSectionId | null {
  const idx = QUESTION_SECTION_ORDER.indexOf(current);
  if (idx < 0 || idx >= QUESTION_SECTION_ORDER.length - 1) return null;
  return QUESTION_SECTION_ORDER[idx + 1];
}

export function prevSection(
  current: QuestionSectionId,
): QuestionSectionId | null {
  const idx = QUESTION_SECTION_ORDER.indexOf(current);
  if (idx <= 0) return null;
  return QUESTION_SECTION_ORDER[idx - 1];
}

export function sectionContinueLabel(section: QuestionSectionId): string {
  if (section === "tfng") return "Continue to Questions 6–9";
  if (section === "matching_headings") return "Continue to Questions 10–13";
  return "Submit passage";
}
