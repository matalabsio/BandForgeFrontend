import type {
  SpeakingReleaseMetadata,
  SpeakingReleaseState,
} from "@/modules/speaking/types";

type SpeakingReviewStatus = Pick<
  SpeakingReleaseMetadata,
  "release_state" | "report_available"
> | {
  release: {
    state: SpeakingReleaseState;
  };
};

export function speakingPendingPath(testNumber: number, attemptId: string): string {
  return `/test/${testNumber}/speaking/pending?attempt=${encodeURIComponent(attemptId)}`;
}

export function speakingReportPath(testNumber: number, attemptId: string): string {
  return `/test/${testNumber}/speaking/results?attempt=${encodeURIComponent(attemptId)}`;
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

export function speakingReportIsAvailable(status: SpeakingReviewStatus): boolean {
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
