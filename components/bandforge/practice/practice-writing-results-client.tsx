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
import { ResultPageViewport } from "@/modules/shared/components/result-page-viewport";

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

  const backHref = fromPlan ? "/study-plan/today" : "/practice/writing";
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
    if (!fromPlan) return;
    void import("@/lib/plan-step-completion").then(({ markPlanStepDone }) => {
      markPlanStepDone({
        fromPlan: true,
        hubId,
        currentTaskId: planTaskId,
        completeHub: false,
      });
    });
  }, [fromPlan, hubId, planTaskId]);

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
      <ResultPageViewport centered unlockKey="loading">
        <p
          className="inline-flex items-center gap-2 text-sm text-ink/60"
          aria-busy
        >
          <Loader2 className="size-4 animate-spin" />
          Loading your writing submission…
        </p>
      </ResultPageViewport>
    );
  }

  if (error && !review) {
    return (
      <ResultPageViewport centered unlockKey={`error-${error}`}>
        <p className="text-danger" role="alert">
          {error}
        </p>
        <Link href={backHref} className="mt-4 font-semibold text-cyan hover:underline">
          Back
        </Link>
      </ResultPageViewport>
    );
  }

  if (!review) return null;

  const analyzing = !aiReady(review.ai_status) && review.ai_status !== "ai_failed";
  if (analyzing) {
    return (
      <ResultPageViewport centered unlockKey={`analyzing-${review.ai_status}`} contentClassName="max-w-lg text-center">
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
      </ResultPageViewport>
    );
  }

  if (review.ai_status === "ai_failed") {
    const underLimit =
      Boolean(review.short_response) ||
      (typeof review.error === "string" &&
        review.error.toLowerCase().includes("too short")) ||
      review.word_count < 100;
    return (
      <ResultPageViewport centered unlockKey="ai-failed" contentClassName="max-w-lg text-center">
        <h1 className="font-display text-h2 text-navy">
          {underLimit ? "Essay under word limit" : "AI analysis unavailable"}
        </h1>
        <p className="text-body text-ink/65">
          {underLimit
            ? "Your essay is under the minimum word count for AI evaluation (need at least 100 words). Your submission was saved for examiner review."
            : review.error ||
              "We could not score this essay right now. Your submission was saved."}
        </p>
        <Link
          href={continueHref}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-teal px-5 py-3 font-semibold text-white"
        >
          Continue
        </Link>
      </ResultPageViewport>
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
