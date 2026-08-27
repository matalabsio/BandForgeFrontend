"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { afterPlanStepHref, type PlanTaskKind } from "@/lib/plan-task-flow";
import {
  getPracticeWritingReview,
  type PracticeWritingReview,
} from "@/lib/practice-api";
import type { WritingReview } from "@/modules/writing/types";
import { WritingResultsView } from "@/modules/writing/components/writing-results-view";

const POLL_MS = 4_000;

type Props = {
  hubId: string;
  attemptId: string;
  fromPlan?: boolean;
  planTaskId?: string | null;
  planTask?: PlanTaskKind | null;
};

function aiReady(status: string | null | undefined): boolean {
  return status === "ai_complete" || status === "ai_stub";
}

function toWritingReview(data: PracticeWritingReview): WritingReview {
  return {
    attempt_id: data.attempt_id,
    status: data.status,
    module: "writing",
    part: data.part,
    test_title: data.test_title,
    question_type: data.question_type,
    prompt: data.prompt,
    options: null,
    user_answer: data.user_answer,
    word_count: data.word_count,
    band: data.band,
    ai_band: data.ai_band,
    ai_available: data.ai_available,
    ai_status: data.ai_status,
    band_source: data.band_source,
    human_verified: false,
    reviewer_notes: null,
    ai_criteria: data.ai_criteria,
    ai_strengths: data.ai_strengths,
    ai_improvements: data.ai_improvements,
    ai_model_name: data.ai_model_name,
    ai_provider: data.ai_provider,
    spelling_mistakes: data.spelling_mistakes,
    grammar_mistakes: data.grammar_mistakes,
    next_band_advice: data.next_band_advice,
    confidence: data.confidence,
    vocabulary_highlights: data.vocabulary_highlights,
    strong_spans: data.strong_spans,
    min_words: data.min_words,
    submitted_at: data.submitted_at,
    saved_for_review: true,
  };
}

export function PracticeWritingResultsClient({
  hubId,
  attemptId,
  fromPlan = false,
  planTaskId = null,
  planTask = null,
}: Props) {
  const router = useRouter();
  const [review, setReview] = useState<PracticeWritingReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const backHref = fromPlan ? "/study-plan/today" : `/practice/writing/${hubId}`;
  const continueHref = useMemo(() => {
    if (!fromPlan) return "/practice/writing";
    return afterPlanStepHref({
      skill: "writing",
      hubId,
      currentTask: planTask ?? "practice",
      currentTaskId: planTaskId,
    });
  }, [fromPlan, hubId, planTask, planTaskId]);

  const load = useCallback(async () => {
    try {
      const data = await getPracticeWritingReview(hubId, attemptId);
      setReview(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load writing feedback.");
    } finally {
      setLoading(false);
    }
  }, [attemptId, hubId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!review) return;
    if (aiReady(review.ai_status) || review.ai_status === "ai_failed") return;
    const timer = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load, review]);

  if (loading && !review) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="inline-flex items-center gap-2 text-sm text-ink/60" aria-busy>
          <Loader2 className="size-4 animate-spin" />
          Loading your writing submission…
        </p>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
        <p className="text-danger" role="alert">
          {error}
        </p>
        <Link href={backHref} className="font-semibold text-cyan hover:underline">
          Back
        </Link>
      </div>
    );
  }

  if (!review) return null;

  const analyzing = !aiReady(review.ai_status) && review.ai_status !== "ai_failed";
  if (analyzing) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <Loader2 className="size-10 animate-spin text-teal" aria-hidden />
        <p className="mt-6 text-meta font-semibold uppercase tracking-[0.14em] text-teal">
          Writing submitted
        </p>
        <h1 className="mt-2 font-display text-h2 text-navy">
          Analyzing your essay…
        </h1>
        <p className="mt-4 text-body text-ink/65">
          Production AI examiner (same as mock tests). This usually takes under a
          minute.
        </p>
        {review.word_count_estimate != null ? (
          <p className="mt-4 text-sm text-ink/50">
            Word-count estimate · Band{" "}
            {Number(review.word_count_estimate).toFixed(1)}
          </p>
        ) : null}
        <Link
          href={continueHref}
          className="mt-10 text-sm font-semibold text-ink/60 hover:underline"
        >
          Continue without waiting →
        </Link>
      </div>
    );
  }

  if (review.ai_status === "ai_failed") {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
        <h1 className="font-display text-h2 text-navy">AI analysis unavailable</h1>
        <p className="text-body text-ink/65">
          {review.error ||
            "We could not score this essay right now. Your submission was saved."}
        </p>
        <Link
          href={continueHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-teal px-5 py-3 font-semibold text-white"
        >
          Continue
        </Link>
      </div>
    );
  }

  return (
    <WritingResultsView
      review={toWritingReview(review)}
      mode="mock"
      titleOverride={review.test_title || `Writing Task ${review.part} practice`}
      backHref={backHref}
      dashboardHref={continueHref}
      primaryActionLabel={fromPlan ? "Continue plan" : "Back to Writing hubs"}
      onPrimaryAction={() => router.push(continueHref)}
    />
  );
}
