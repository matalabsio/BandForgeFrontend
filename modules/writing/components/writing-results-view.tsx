"use client";

import type { WritingReview } from "@/modules/writing/types";
import { buildWritingFeedback } from "@/modules/writing/lib/build-writing-feedback";
import { WritingFeedbackView } from "@/modules/writing/components/writing-feedback-view";

type Props = {
  review: WritingReview;
  mockAttemptId?: string | null;
  mockSlug?: string;
  showContinueTask2?: boolean;
  backHref?: string;
  dashboardHref?: string;
};

export function WritingResultsView({
  review,
  mockAttemptId,
  mockSlug = "m01",
  showContinueTask2 = false,
  backHref,
  dashboardHref = "/dashboard",
}: Props) {
  const feedback = buildWritingFeedback(review);

  return (
    <WritingFeedbackView
      review={review}
      feedback={feedback}
      mockAttemptId={mockAttemptId}
      mockSlug={mockSlug}
      showContinueTask2={showContinueTask2}
      backHref={backHref}
      dashboardHref={dashboardHref}
    />
  );
}
