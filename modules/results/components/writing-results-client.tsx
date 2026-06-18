"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readModuleResultAttempt } from "@/lib/exam-session-storage";
import { writingTestHubPath } from "@/lib/writing-test";
import { writingApi } from "@/modules/writing/services/writing-api";
import type { WritingReview } from "@/modules/writing/types";
import { WritingResultsView } from "@/modules/writing/components/writing-results-view";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { mockTestIdForNumber } from "@/lib/mock-catalog";

type Props = {
  testNumber: number;
};

export function WritingResultsClient({ testNumber }: Props) {
  const mockTestId = mockTestIdForNumber(testNumber);
  const mockAttemptId = useResolvedMockAttemptId(mockTestId);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [review, setReview] = useState<WritingReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readModuleResultAttempt(testNumber, "writing");
    setAttemptId(stored);
    if (!stored) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await writingApi.review(stored);
        if (!cancelled) setReview(data);
      } catch {
        if (!cancelled) setReview(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [testNumber]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-ink/60">
        Loading your writing feedback…
      </div>
    );
  }

  if (!attemptId || !review) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface p-8 text-center">
        <p className="text-[14px] text-ink/70">
          Open this result from your dashboard or right after you finish a task.
        </p>
        <Link
          href={writingTestHubPath()}
          className="mt-4 inline-flex min-h-[44px] items-center text-cyan font-semibold"
        >
          Back to writing
        </Link>
      </div>
    );
  }

  const showContinueTask2 = review.part === 1 && !mockAttemptId;

  return (
    <WritingResultsView
      review={review}
      mockAttemptId={mockAttemptId}
      showContinueTask2={showContinueTask2}
    />
  );
}
