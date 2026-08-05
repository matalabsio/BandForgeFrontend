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
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
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
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
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
      primaryActionLabel={primaryActionLabel}
      onPrimaryAction={onPrimaryAction}
      secondaryActionLabel={secondaryActionLabel}
      onSecondaryAction={onSecondaryAction}
    />
  );
}
