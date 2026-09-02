import type {
  SpeakingReleaseMetadata,
  SpeakingReleaseState,
} from "@/modules/speaking/types";

const AI_READY_STATUSES = new Set(["ai_complete", "ai_stub", "insufficient_speech"]);
const AI_FAILED_STATUSES = new Set([
  "ai_failed",
  "evaluation_failed",
  "failed",
  "error",
]);

export type SpeakingPendingLike = {
  ai_status?: string | null;
  score_source?: string | null;
  ai_band?: number | null;
  release_state?: SpeakingReleaseState;
  report_available?: boolean;
};

type SpeakingReviewStatus = Pick<
  SpeakingReleaseMetadata,
  "release_state" | "report_available"
> | {
  release: {
    state: SpeakingReleaseState;
  };
};

export function speakingPendingPath(
  testNumber: number,
  attemptId: string,
  mockAttemptId?: string | null,
): string {
  const params = new URLSearchParams({ attempt: attemptId });
  const mockAttempt = mockAttemptId?.trim();
  if (mockAttempt) params.set("mock_attempt", mockAttempt);
  return `/test/${testNumber}/speaking/pending?${params.toString()}`;
}

export function speakingReportPath(
  testNumber: number,
  attemptId: string,
  mockAttemptId?: string | null,
): string {
  const params = new URLSearchParams({ attempt: attemptId });
  const mockAttempt = mockAttemptId?.trim();
  if (mockAttempt) params.set("mock_attempt", mockAttempt);
  return `/test/${testNumber}/speaking/results?${params.toString()}`;
}

export function speakingStatusPath(
  testNumber: number,
  attemptId: string,
  status: SpeakingReviewStatus,
): string {
  return speakingReportIsAvailable(status)
    ? speakingReportPath(testNumber, attemptId)
    : speakingPendingPath(testNumber, attemptId);
}

export function speakingReportIsAvailable(
  status: SpeakingReviewStatus | SpeakingPendingLike,
): boolean {
  if ("release" in status) {
    return status.release.state === "released";
  }
  return status.release_state === "released" && status.report_available === true;
}

export function shouldPollSpeakingRelease(state: SpeakingReleaseState): boolean {
  return (
    state === "processing" ||
    state === "awaiting_examiner" ||
    state === "withdrawn"
  );
}

export function shouldNavigateToSpeakingReport(
  status: SpeakingReviewStatus,
  alreadyNavigated: boolean,
): boolean {
  return !alreadyNavigated && speakingReportIsAvailable(status);
}

export function isSpeakingAiFailed(pending: SpeakingPendingLike): boolean {
  const aiStatus = pending.ai_status ?? "";
  return AI_FAILED_STATUSES.has(aiStatus) || pending.score_source === "failed";
}

export function isSpeakingAiReady(pending: SpeakingPendingLike): boolean {
  if (pending.score_source === "insufficient_speech") return true;
  if (pending.ai_status === "insufficient_speech") return true;
  const aiStatus = pending.ai_status ?? "";
  return (
    AI_READY_STATUSES.has(aiStatus) &&
    pending.score_source === "ai_estimate" &&
    pending.ai_band != null
  );
}

export function isSpeakingAnalyzing(pending: SpeakingPendingLike): boolean {
  if (isSpeakingAiReady(pending) || isSpeakingAiFailed(pending)) return false;
  return (
    pending.score_source === "processing" ||
    pending.ai_band == null ||
    !AI_READY_STATUSES.has(pending.ai_status ?? "")
  );
}

/** Poll pending while transcribing/scoring or awaiting examiner release on results. */
export function shouldPollSpeakingPending(pending: SpeakingPendingLike): boolean {
  if (speakingReportIsAvailable(pending)) return false;
  if (isSpeakingAiFailed(pending)) return false;
  if (isSpeakingAnalyzing(pending)) return true;
  if (isSpeakingAiReady(pending)) {
    return shouldPollSpeakingRelease(pending.release_state ?? "awaiting_examiner");
  }
  return shouldPollSpeakingRelease(pending.release_state ?? "processing");
}
