"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { patchLearningTask } from "@/lib/learning-api";
import { afterPlanStepHref, type PlanTaskKind } from "@/lib/plan-task-flow";
import {
  startPracticeExercise,
  submitPracticeExercise,
  type BankExerciseStart,
} from "@/lib/practice-api";
import type { PracticeSkill } from "@/lib/practice-types";
import { practiceSkillLabel } from "@/lib/practice-types";
import { cn } from "@/lib/utils";

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const currentTask = parsePlanTask(planTask) ?? "practice";
  const backHref = fromPlan
    ? "/study-plan/today"
    : `/practice/${skill}/${hubId}`;
  const backLabel = fromPlan ? "Back to today’s plan" : "Back to hub";
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

  async function onSubmit() {
    if (!exercise || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitPracticeExercise(
        hubId,
        exercise.attempt_id,
        answers,
      );
      if (fromPlan && planTaskId) {
        void patchLearningTask(planTaskId, "done").catch(() => {
          /* best-effort */
        });
      }
      if (res.score) {
        setResult(
          `Scored ${res.score.correct}/${res.score.total} (${res.score.percent}%). Hub marked complete.`,
        );
      } else {
        setResult("Submitted. Hub marked complete.");
      }
      if (fromPlan) {
        router.push(nextHref);
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan hover:underline"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
        <BfSectionEyebrow>
          {fromPlan
            ? `Today’s plan · ${practiceSkillLabel(skill)}${
                currentTask ? ` · ${currentTask}` : ""
              }`
            : `${practiceSkillLabel(skill)} practice`}
        </BfSectionEyebrow>
        <BfSectionHeading>
          {loading
            ? "Loading…"
            : exercise?.section.title || `Part ${exercise?.part ?? 1}`}
        </BfSectionHeading>
      </header>

      {loading ? <ExerciseSkeleton /> : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
          <p>{result}</p>
          <p className="flex items-center gap-2 text-muted">
            <Loader2 className="size-4 animate-spin" />
            Taking you to the next step…
          </p>
          <Link
            href={nextHref}
            className="inline-flex font-semibold text-cyan hover:underline"
          >
            {nextLabel} →
          </Link>
        </div>
      ) : null}

      {exercise && !result ? (
        <div className="space-y-6">
          {exercise.section.passage_text ? (
            <div className="rounded-xl border border-border-soft bg-white p-4 text-sm leading-relaxed text-ink/85 whitespace-pre-wrap">
              {exercise.section.passage_text}
            </div>
          ) : null}
          {exercise.section.instructions ? (
            <p className="text-sm text-muted">{exercise.section.instructions}</p>
          ) : null}
          {exercise.section.audio_key ? (
            <p className="text-xs text-muted">
              Audio key: {exercise.section.audio_key}
            </p>
          ) : null}

          <ol className="space-y-4">
            {exercise.section.questions.map((q) => (
              <li
                key={q.id}
                className="rounded-xl border border-border-soft bg-white p-4 space-y-2"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  Q{q.question_number} · {q.question_type}
                </p>
                <p className="text-sm font-medium text-navy whitespace-pre-wrap">
                  {q.prompt}
                </p>
                <input
                  className={cn(
                    "w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm",
                    "outline-none focus:border-cyan",
                  )}
                  placeholder="Your answer"
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              </li>
            ))}
          </ol>

          <button
            type="button"
            disabled={submitting}
            onClick={() => void onSubmit()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : fromPlan && nextHref !== "/study-plan/today" ? (
              "Submit & continue"
            ) : (
              "Submit practice"
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
