import { canonicalMockSlug, mockTestIdForNumber } from "@/lib/mock-catalog";
import { readMockAttemptId } from "@/lib/exam-session-storage";

type ResolveOpts = {
  testNumber: number;
  /** Prefer payload-linked mock attempt when available. */
  mockAttemptId?: string | null;
};

/**
 * Back destination from a section score report → Performance (/scores).
 */
export function resolveSectionResultsBackHref({
  testNumber,
  mockAttemptId,
}: ResolveOpts): { href: string; label: string } {
  const fromPayload = mockAttemptId?.trim() || null;
  const fromSession =
    typeof window !== "undefined"
      ? readMockAttemptId(mockTestIdForNumber(testNumber))
      : null;
  const resolvedMock = fromPayload || fromSession;
  const mockSlug = canonicalMockSlug(mockTestIdForNumber(testNumber));

  if (resolvedMock) {
    const params = new URLSearchParams({
      fresh: "1",
      mock: mockSlug,
    });
    return {
      href: `/scores?${params.toString()}`,
      label: "Back to scores",
    };
  }

  return {
    href: "/scores",
    label: "Back to scores",
  };
}

export function resolveSectionResultsBackFallbackHref(_testNumber: number): string {
  return "/scores";
}
