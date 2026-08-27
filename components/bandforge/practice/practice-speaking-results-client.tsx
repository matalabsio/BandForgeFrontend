"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { afterPlanStepHref, type PlanTaskKind } from "@/lib/plan-task-flow";
import {
  getPracticeSpeakingReview,
  type PracticeSpeakingReview,
} from "@/lib/practice-api";
import { SpeakingAiEstimateView } from "@/modules/speaking/components/speaking-ai-estimate-view";
import type { SpeakingPendingPayload } from "@/modules/speaking/types";

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

function toPendingPayload(data: PracticeSpeakingReview): SpeakingPendingPayload {
  const evidence = (data.ai_evidence ?? []).map((item) => ({
    quote: String(item.quote ?? ""),
    criterion: (item.criterion as "FC" | "LR" | "GRA" | "P") || "FC",
    polarity: (item.polarity as "strength" | "weakness") || "weakness",
    part: Number(item.part) || 1,
    issue: item.issue != null ? String(item.issue) : null,
    title: item.title != null ? String(item.title) : null,
    explanation: item.explanation != null ? String(item.explanation) : null,
    suggestion: item.suggestion != null ? String(item.suggestion) : null,
  }));
  const patterns = (data.ai_patterns ?? []).map((item) => ({
    pattern: String(item.pattern ?? ""),
    criterion: (item.criterion as "FC" | "LR" | "GRA" | "P") || "GRA",
    frequency: (item.frequency as "rare" | "sometimes" | "often") || "sometimes",
    examples: Array.isArray(item.examples)
      ? item.examples.map((ex) => String(ex))
      : [],
  }));
  const parts = (data.ai_parts ?? []).map((item) => ({
    part: Number(item.part) || 1,
    note: String(item.note ?? ""),
    band_estimate: Number(item.band_estimate) || 0,
  }));
  const responses = (data.responses ?? []).map((row) => ({
    id: row.id,
    question_id: row.question_id,
    part: row.part,
    sequence: row.sequence,
    prompt: row.prompt,
    duration_sec: row.duration_sec,
    transcription_status: row.transcription_status,
    transcript: row.transcript,
    transcription_error: null,
  }));

  return {
    attempt_id: data.speaking_attempt_id || data.attempt_id,
    status: data.status,
    review_status: "pending",
    human_band: null,
    ai_status: data.ai_status,
    evaluation_status: data.evaluation_status,
    score_source: "ai_estimate",
    ai_band: data.ai_band ?? null,
    ai_criteria: data.ai_criteria ?? {},
    ai_strengths: data.ai_strengths ?? [],
    ai_improvements: data.ai_improvements ?? [],
    next_band_advice: data.next_band_advice ?? null,
    ai_parts: parts,
    ai_evidence: evidence,
    ai_patterns: patterns,
    ai_fluency: (data.ai_fluency ?? {}) as SpeakingPendingPayload["ai_fluency"],
    ai_part_metrics: {},
    responses,
    submitted_at: data.submitted_at ?? null,
    student_name: null,
    message: "Provisional AI Speaking estimate for this practice set.",
    transcription_progress: null,
    release_state: "awaiting_examiner",
    report_available: false,
    released_at: null,
    approval_version: 0,
    reviewer: null,
  };
}

export function PracticeSpeakingResultsClient({
  hubId,
  attemptId,
  fromPlan = false,
  planTaskId = null,
  planTask = null,
}: Props) {
  const router = useRouter();
  const [review, setReview] = useState<PracticeSpeakingReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const backHref = fromPlan
    ? "/study-plan/today"
    : `/practice/speaking/${hubId}`;
  const continueHref = useMemo(() => {
    if (!fromPlan) return "/practice/speaking";
    return afterPlanStepHref({
      skill: "speaking",
      hubId,
      currentTask: planTask ?? "practice",
      currentTaskId: planTaskId,
    });
  }, [fromPlan, hubId, planTask, planTaskId]);

  const load = useCallback(async () => {
    try {
      const data = await getPracticeSpeakingReview(hubId, attemptId);
      setReview(data);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load speaking feedback.",
      );
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
        <p
          className="inline-flex items-center gap-2 text-sm text-ink/60"
          aria-busy
        >
          <Loader2 className="size-4 animate-spin" />
          Loading your speaking submission…
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

  const analyzing =
    !aiReady(review.ai_status) && review.ai_status !== "ai_failed";
  if (analyzing) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <Loader2 className="size-10 animate-spin text-teal" aria-hidden />
        <p className="mt-6 text-meta font-semibold uppercase tracking-[0.14em] text-teal">
          Speaking submitted
        </p>
        <h1 className="mt-2 font-display text-h2 text-navy">
          Transcribing and scoring…
        </h1>
        <p className="mt-4 text-body text-ink/65">
          Whisper transcription plus the same Speaking AI examiner used on mocks.
          This usually takes one to two minutes.
        </p>
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
            "We could not score this speaking set right now. Your recordings were saved."}
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
    <SpeakingAiEstimateView
      testNumber={0}
      payload={toPendingPayload(review)}
      primaryActionLabel={fromPlan ? "Continue plan" : "Back to Speaking hubs"}
      onPrimaryAction={() => router.push(continueHref)}
      secondaryActionLabel={fromPlan ? undefined : "Back to this set"}
      onSecondaryAction={
        fromPlan ? undefined : () => router.push(backHref)
      }
      backHref={backHref}
      backLabel={fromPlan ? "Today’s plan" : "Back to set"}
      fallbackHref="/practice/speaking"
    />
  );
}
