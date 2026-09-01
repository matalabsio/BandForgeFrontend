"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { afterPlanStepHref, type PlanTaskKind } from "@/lib/plan-task-flow";
import {
  getPracticeListeningReview,
  getPracticeReadingReview,
  type PracticeObjectiveReview,
} from "@/lib/practice-api";
import { practiceSkillLabel } from "@/lib/practice-types";
import { PracticeSectionResultsClient } from "@/modules/results/components/practice-section-results-client";
import { SectionResultsShell } from "@/modules/shared/components/section-results";

type Module = "listening" | "reading";

type Props = {
  module: Module;
  hubId: string;
  attemptId: string;
  fromPlan?: boolean;
  planTaskId?: string | null;
  planTask?: PlanTaskKind | null;
};

export function PracticeObjectiveResultsClient({
  module,
  hubId,
  attemptId,
  fromPlan = false,
  planTaskId = null,
  planTask = null,
}: Props) {
  const [review, setReview] = useState<PracticeObjectiveReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const skillLabel = practiceSkillLabel(module);
  const backHref = fromPlan ? "/study-plan/today" : `/practice/${module}/${hubId}`;
  const continueHref = useMemo(() => {
    if (!fromPlan) return `/practice/${module}`;
    return afterPlanStepHref({
      skill: module,
      hubId,
      currentTask: planTask ?? "practice",
      currentTaskId: planTaskId,
    });
  }, [fromPlan, hubId, module, planTask, planTaskId]);

  const load = useCallback(async () => {
    try {
      const data =
        module === "listening"
          ? await getPracticeListeningReview(hubId, attemptId)
          : await getPracticeReadingReview(hubId, attemptId);
      setReview(data);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : `Could not load your ${skillLabel.toLowerCase()} results.`,
      );
    } finally {
      setLoading(false);
    }
  }, [attemptId, hubId, module, skillLabel]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !review) {
    return (
      <SectionResultsShell centered>
        <p className="font-display text-base font-bold text-navy">
          Loading your {skillLabel.toLowerCase()} results…
        </p>
      </SectionResultsShell>
    );
  }

  if (error && !review) {
    return (
      <SectionResultsShell centered>
        <p className="max-w-sm text-center text-sm text-muted" role="alert">
          {error}
        </p>
        <Link href={backHref} className="mt-4 text-sm font-semibold text-cyan">
          Back
        </Link>
      </SectionResultsShell>
    );
  }

  if (!review || review.questions.length === 0) {
    return (
      <SectionResultsShell centered>
        <p className="max-w-sm text-center text-sm text-muted">
          Could not load your {skillLabel.toLowerCase()} results.
        </p>
        <Link href={backHref} className="mt-4 text-sm font-semibold text-cyan">
          Back
        </Link>
      </SectionResultsShell>
    );
  }

  return (
    <PracticeSectionResultsClient
      module={module}
      title={`${skillLabel} practice`}
      subtitle={`${review.total_questions} questions · ${skillLabel}`}
      rawScore={review.raw_score}
      total={review.total_questions}
      questions={review.questions}
      backHref={backHref}
      primaryHref={continueHref}
      primaryLabel={
        fromPlan
          ? continueHref === "/study-plan/today"
            ? "Back to Today's plan"
            : "Continue plan"
          : `Back to ${skillLabel} hubs`
      }
    />
  );
}
