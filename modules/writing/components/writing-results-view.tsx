"use client";

import type { WritingReview } from "@/modules/writing/types";
import { buildWritingFeedback } from "@/modules/writing/lib/build-writing-feedback";
import {
  WritingFeedbackView,
  type WritingFeedbackMode,
} from "@/modules/writing/components/writing-feedback-view";

type Props = {
  review: WritingReview;
  mode?: WritingFeedbackMode;
  mockAttemptId?: string | null;
  mockSlug?: string;
  showContinueTask2?: boolean;
  backHref?: string;
  dashboardHref?: string;
  onBack?: () => void;
  targetBand?: number | null;
  coachOpen?: boolean;
};

export function WritingResultsView({
  review,
  mode = "mock",
  mockAttemptId,
  mockSlug = "m01",
  showContinueTask2 = false,
  backHref,
  dashboardHref = "/dashboard",
  onBack,
  targetBand = null,
  coachOpen = false,
}: Props) {
  const feedback = buildWritingFeedback(review, { targetBand });

  return (
    <WritingFeedbackView
      review={review}
      feedback={feedback}
      mode={mode}
      mockAttemptId={mockAttemptId}
      mockSlug={mockSlug}
      showContinueTask2={showContinueTask2}
      backHref={backHref}
      dashboardHref={dashboardHref}
      onBack={onBack}
      coachOpen={coachOpen}
    />
  );
}
