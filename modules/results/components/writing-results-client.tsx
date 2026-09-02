"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { persistModuleResultAttempt, readModuleResultAttempt } from "@/lib/exam-session-storage";
import { writingTestHubPath } from "@/lib/writing-test";
import { writingApi } from "@/modules/writing/services/writing-api";
import type { WritingReview } from "@/modules/writing/types";
import { WritingResultsView } from "@/modules/writing/components/writing-results-view";
import { WritingTaskTabs } from "@/modules/writing/components/writing-task-tabs";
import { ResultPageViewport } from "@/modules/shared/components/result-page-viewport";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { resolveSectionResultsBackHref } from "@/lib/section-results-back";
import type { PlanResultContext } from "@/lib/plan-day-tasks";
import { usePlanResultsNav } from "@/components/bandforge/plan/plan-results-cta-bar";
import { useRouter } from "next/navigation";

type Props = {
  testNumber: number;
  mockTestId: string;
  attemptFromQuery?: string;
  targetBand?: number | null;
  plan?: PlanResultContext | null;
};

export function WritingResultsClient({
  testNumber,
  mockTestId,
  attemptFromQuery,
  targetBand = null,
  plan = null,
}: Props) {
  const router = useRouter();
  const planNav = usePlanResultsNav(plan);
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

  const aiPending =
    review != null &&
    review.band_source !== "human" &&
    review.band_source !== "module_score" &&
    review.ai_status !== "ai_complete" &&
    review.ai_status !== "ai_stub" &&
    review.ai_status !== "ai_failed";

  useEffect(() => {
    if (!attemptId || !aiPending) return;
    const timer = window.setInterval(() => {
      void writingApi
        .review(attemptId)
        .then((data) => setReview(data))
        .catch(() => undefined);
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [aiPending, attemptId]);

  const backNav = useMemo(
    () =>
      resolveSectionResultsBackHref({
        testNumber,
        mockAttemptId,
      }),
    [mockAttemptId, testNumber],
  );

  if (loading) {
    return (
      <ResultPageViewport centered unlockKey="loading">
        <p className="text-sm text-ink/60">Loading your writing feedback…</p>
      </ResultPageViewport>
    );
  }

  if (!attemptId || !review) {
    return (
      <ResultPageViewport centered unlockKey="missing">
        <p className="text-[14px] text-ink/70">
          Open this result from your dashboard or right after you finish a task.
        </p>
        <Link
          href={writingTestHubPath()}
          className="mt-4 inline-flex min-h-[44px] items-center text-cyan font-semibold"
        >
          Back to writing
        </Link>
      </ResultPageViewport>
    );
  }

  const showContinueTask2 = review.part === 1 && !mockAttemptId && !planNav;
  const sessionTasks = review.session_tasks ?? [];

  return (
    <div>
      {sessionTasks.length > 1 ? (
        <div className="border-b border-ink/8 bg-white px-4 py-4 md:px-8">
          <WritingTaskTabs
            testNumber={testNumber}
            currentAttemptId={attemptId}
            tasks={sessionTasks}
            mockAttemptId={mockAttemptId}
          />
        </div>
      ) : null}
      <WritingResultsView
        review={review}
        mockAttemptId={mockAttemptId}
        showContinueTask2={showContinueTask2}
        targetBand={targetBand}
        backHref={planNav?.todayHref ?? backNav.href}
        dashboardHref={planNav?.todayHref ?? "/dashboard"}
        primaryActionLabel={planNav?.continueLabel}
        onPrimaryAction={
          planNav ? () => router.push(planNav.continueHref) : undefined
        }
        secondaryActionLabel={
          planNav?.showSecondaryBack ? "Back to Today's plan" : undefined
        }
        onSecondaryAction={
          planNav?.showSecondaryBack
            ? () => router.push(planNav.todayHref)
            : undefined
        }
        titleOverride={
          planNav ? `Writing Task ${review.part} practice` : null
        }
      />
    </div>
  );
}
