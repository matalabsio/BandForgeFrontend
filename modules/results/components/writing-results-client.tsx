"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { persistModuleResultAttempt, readModuleResultAttempt } from "@/lib/exam-session-storage";
import { writingTestHubPath } from "@/lib/writing-test";
import { writingApi } from "@/modules/writing/services/writing-api";
import type { WritingReview } from "@/modules/writing/types";
import { WritingResultsView } from "@/modules/writing/components/writing-results-view";
import { WritingTaskTabs } from "@/modules/writing/components/writing-task-tabs";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { mockTestIdForNumber } from "@/lib/mock-catalog";

type Props = {
  testNumber: number;
  attemptFromQuery?: string;
};

export function WritingResultsClient({ testNumber, attemptFromQuery }: Props) {
  const mockTestId = mockTestIdForNumber(testNumber);
  const mockAttemptId = useResolvedMockAttemptId(mockTestId);
  const queryAttempt = attemptFromQuery?.trim() || null;
  // Only seed from URL so server and client first paint match (no sessionStorage on SSR).
  const [attemptId, setAttemptId] = useState<string | null>(queryAttempt);
  const [review, setReview] = useState<WritingReview | null>(null);
  const [loading, setLoading] = useState(Boolean(queryAttempt));

  useEffect(() => {
    const fromSession = readModuleResultAttempt(testNumber, "writing");
    const next = queryAttempt || fromSession;
    setAttemptId(next);
  }, [queryAttempt, testNumber]);

  useEffect(() => {
    if (attemptId) {
      persistModuleResultAttempt(testNumber, "writing", attemptId);
    }
  }, [attemptId, testNumber]);

  useEffect(() => {
    if (!attemptId) {
      setReview(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setReview(null);
    const load = async () => {
      setLoading(true);
      try {
        const data = await writingApi.review(attemptId);
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
  }, [attemptId]);

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
  const sessionTasks = review.session_tasks ?? [];

  return (
    <div>
      {sessionTasks.length > 1 ? (
        <div className="border-b border-ink/8 bg-white px-4 py-4 md:px-8">
          <WritingTaskTabs
            testNumber={testNumber}
            currentAttemptId={attemptId}
            tasks={sessionTasks}
          />
        </div>
      ) : null}
      <WritingResultsView
        review={review}
        mockAttemptId={mockAttemptId}
        showContinueTask2={showContinueTask2}
      />
    </div>
  );
}
