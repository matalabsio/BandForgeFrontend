/** Published IELTS listening test (Greenfield College Part 1, Q1–10). */
export const LISTENING_TEST_ID = "d0000000-0000-4000-8000-000000000001";

export function isListeningTest(testId: string): boolean {
  return testId === LISTENING_TEST_ID;
}

export function listeningTestPath(): string {
  return "/test/listening";
}

export function listeningTestResumePath(): string {
  return "/test/listening?auto=1";
}

export function listeningResultsPath(attemptId: string): string {
  return `/test/listening/results/${encodeURIComponent(attemptId)}`;
}

/** Route for a published test’s listening module (production vs dev mock). */
export function listeningModulePath(testId: string): string {
  if (isListeningTest(testId)) {
    return listeningTestPath();
  }
  return `/mock/${encodeURIComponent(testId)}/listening`;
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
