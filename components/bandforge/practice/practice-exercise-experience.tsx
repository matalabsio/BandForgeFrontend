"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PracticeListeningExam } from "@/components/bandforge/practice/practice-listening-exam";
import { PracticeReadingExam } from "@/components/bandforge/practice/practice-reading-exam";
import { PracticeSpeakingExam } from "@/components/bandforge/practice/practice-speaking-exam";
import { PracticeWritingExam } from "@/components/bandforge/practice/practice-writing-exam";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { flattenExamAnswers } from "@/lib/bank-exercise-to-exam";
import { afterPlanStepHref, type PlanTaskKind } from "@/lib/plan-task-flow";
import { completePlanStepAndGetNextHref } from "@/lib/plan-step-completion";
import {
  startPracticeExercise,
  submitPracticeExercise,
  type BankExerciseStart,
} from "@/lib/practice-api";
import type { PracticeSkill } from "@/lib/practice-types";
import { practiceSkillLabel } from "@/lib/practice-types";

type Props = {
  skill: PracticeSkill;
  hubId: string;
  fromPlan?: boolean;
  planTaskId?: string | null;
  planTask?: string | null;
};

/** Dedupe Strict Mode / remount double POST to exercise/start. */
const inflightExerciseStarts = new Map<string, Promise<BankExerciseStart>>();

function startExerciseOnce(hubId: string): Promise<BankExerciseStart> {
  const existing = inflightExerciseStarts.get(hubId);
  if (existing) return existing;
  const pending = startPracticeExercise(hubId).finally(() => {
    inflightExerciseStarts.delete(hubId);
  });
  inflightExerciseStarts.set(hubId, pending);
  return pending;
}

function ExerciseSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading exercise">
      <div className="h-5 w-40 animate-pulse rounded bg-ink/[0.06]" />
      <div className="h-8 w-56 max-w-full animate-pulse rounded-lg bg-ink/[0.06]" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-ink/[0.06]" />
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl border border-border-soft bg-ink/[0.04]"
        />
      ))}
    </div>
  );
}

function parsePlanTask(value: string | null | undefined): PlanTaskKind | null {
  if (value === "watch" || value === "practice" || value === "submit") return value;
  return null;
}

export function PracticeExerciseExperience({
  skill,
  hubId,
  fromPlan = false,
  planTaskId = null,
  planTask = null,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercise, setExercise] = useState<BankExerciseStart | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const currentTask = parsePlanTask(planTask) ?? "practice";
  const backHref = fromPlan
    ? "/study-plan/today"
    : `/practice/${skill}/${hubId}`;
  const backLabel = fromPlan ? "← Today’s plan" : "← Back to hub";
  const nextHref = fromPlan
    ? afterPlanStepHref({
        skill,
        hubId,
        currentTask,
        currentTaskId: planTaskId,
      })
    : `/practice/${skill}`;
  const nextLabel =
    fromPlan && nextHref !== "/study-plan/today"
      ? "Continue to Submit"
      : fromPlan
        ? "Back to today’s plan"
        : `Back to ${practiceSkillLabel(skill)} hubs`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const started = await startExerciseOnce(hubId);
        if (!cancelled) setExercise(started);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "No bank content for this hub yet. Ask an admin to add Question bank items.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hubId]);

  async function onSubmit(rawAnswers: Record<string, string>) {
    if (!exercise || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitPracticeExercise(
        hubId,
        exercise.attempt_id,
        flattenExamAnswers(rawAnswers),
      );
      const planNext =
        completePlanStepAndGetNextHref({
          fromPlan,
          skill,
          hubId,
          currentTask,
          currentTaskId: planTaskId,
          completeHub: false,
        }) ?? nextHref;

      // Writing bank: production AI eval (v5) → full feedback page (same as mocks).
      if (skill === "writing" && res.writing_ai_pending) {
        const q = new URLSearchParams({ attempt: res.attempt_id });
        if (fromPlan) {
          q.set("from", "plan");
          if (planTaskId) q.set("taskId", planTaskId);
          if (currentTask) q.set("task", currentTask);
        }
        router.push(
          `/practice/writing/${hubId}/exercise/results?${q.toString()}`,
        );
        return;
      }

      const objective = res.score as
        | { correct?: number; total?: number; percent?: number }
        | null;
      if (
        objective &&
        typeof objective.correct === "number" &&
        typeof objective.total === "number"
      ) {
        setResult(
          `Scored ${objective.correct}/${objective.total} (${objective.percent}%). Hub marked complete.`,
        );
      } else {
        setResult("Submitted. Hub marked complete.");
      }
      router.push(fromPlan ? planNext : nextHref);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <ExerciseSkeleton />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan hover:underline"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
        <BfSectionEyebrow>{practiceSkillLabel(skill)} practice</BfSectionEyebrow>
        <BfSectionHeading>Could not start</BfSectionHeading>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error ?? "No bank content for this hub yet."}
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
          {result}
        </p>
        <p className="flex items-center gap-2 text-muted">
          <Loader2 className="size-4 animate-spin" />
          Taking you to the next step…
        </p>
        <Link href={nextHref} className="inline-flex font-semibold text-cyan hover:underline">
          {nextLabel} →
        </Link>
      </div>
    );
  }

  const examProps = {
    exercise,
    hubHref: backHref,
    hubLabel: backLabel,
    busy: submitting,
    error,
    onSubmit,
  };

  if (skill === "listening") {
    return <PracticeListeningExam {...examProps} />;
  }
  if (skill === "reading") {
    return <PracticeReadingExam {...examProps} />;
  }
  if (skill === "writing") {
    return <PracticeWritingExam {...examProps} />;
  }
  return <PracticeSpeakingExam {...examProps} />;
}
