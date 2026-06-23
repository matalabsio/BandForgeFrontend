"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EvaluatorAiPrescore,
  EvaluatorAudioPlayer,
  EvaluatorCriteriaRubric,
  EvaluatorCueCard,
  EvaluatorOverallBand,
  EvaluatorPartTabs,
  EvaluatorReviewActions,
  EvaluatorStudentContext,
  EvaluatorStudentHeader,
  EvaluatorQueueBadge,
} from "@/components/admin/evaluator";
import {
  evaluatorCard,
  evaluatorCardPad,
  evaluatorWorkspace,
} from "@/components/admin/evaluator/evaluator-ui";
import { adminLink } from "@/components/admin/admin-ui";
import { adminApi, type SpeakingReviewDetail } from "@/lib/admin-api";
import {
  computeOverallBand,
  CRITERIA_KEYS,
  defaultCriteriaFromReview,
  type HumanCriteriaScores,
} from "@/lib/speaking-band";
import { cn } from "@/lib/utils";

type Props = { reviewId: string };

function isCompleteCriteria(
  scores: Partial<HumanCriteriaScores>,
): scores is HumanCriteriaScores {
  return CRITERIA_KEYS.every((key) => scores[key] != null);
}

export function AdminSpeakingDetailClient({ reviewId }: Props) {
  const [review, setReview] = useState<SpeakingReviewDetail | null>(null);
  const [criteria, setCriteria] = useState<Partial<HumanCriteriaScores>>({});
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await adminApi.getSpeaking(reviewId);
      setReview(data);
      setFeedback(data.reviewer_notes ?? "");
      const defaults = defaultCriteriaFromReview(
        data.human_criteria_scores,
        data.ai_scores,
      );
      setCriteria(defaults ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load review");
    }
  }, [reviewId]);

  useEffect(() => {
    void load();
  }, [load]);

  const overall = useMemo(() => computeOverallBand(criteria), [criteria]);
  const readOnly = review?.status === "completed";
  const activePart = review?.submission_meta?.part ?? 2;

  const onCriteriaChange = (key: keyof HumanCriteriaScores, value: number) => {
    setCriteria((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
  };

  const saveDraft = async () => {
    if (!review) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const body: Parameters<typeof adminApi.patchSpeaking>[1] = {
        reviewer_notes: feedback || undefined,
        status: "in_review",
      };
      if (isCompleteCriteria(criteria)) {
        body.human_criteria_scores = criteria;
      }
      const updated = await adminApi.patchSpeaking(reviewId, body);
      setReview(updated);
      setSuccess("Draft saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save draft");
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async () => {
    if (!isCompleteCriteria(criteria)) {
      setError("Select a half-band for all four criteria before submitting.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await adminApi.approveSpeaking(reviewId, {
        human_criteria_scores: criteria,
        reviewer_notes: feedback || undefined,
      });
      setReview(updated);
      setCriteria(updated.human_criteria_scores ?? criteria);
      setSuccess("Review submitted successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  if (!review && !error) {
    return (
      <div className={cn(evaluatorWorkspace, "space-y-4 p-4 sm:p-5")} aria-busy>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/80" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/80" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/20" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/80" />
      </div>
    );
  }

  if (error && !review) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!review) return null;

  const studentName =
    review.student_name ?? review.student_email ?? "Speaking review";

  const actionProps = {
    feedback,
    onFeedbackChange: setFeedback,
    onSaveDraft: () => void saveDraft(),
    onSubmit: () => void submitReview(),
    busy,
    readOnly,
    successMessage: success,
    error,
  };

  return (
    <div className={cn(evaluatorWorkspace, "overflow-hidden")}>
      <div className="border-b border-[#EAEEF3] bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/speaking" className={adminLink}>
            ← Back to queue
          </Link>
          <EvaluatorQueueBadge count={review.queue_pending_count} />
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-6 lg:p-7">
        <EvaluatorStudentHeader
          name={studentName}
          email={review.student_email}
          submittedAt={review.created_at}
          targetBand={review.student_target_band}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_318px] lg:items-start">
          <div className="space-y-5">
            <EvaluatorAudioPlayer
              audioUrl={review.audio_play_url}
              partLabel={review.submission_meta?.part_label ?? `Part ${activePart}`}
            />

            <EvaluatorPartTabs activePart={activePart} />

            <EvaluatorCueCard
              title={review.submission_meta?.prompt_title}
              cueCard={review.submission_meta?.cue_card}
              transcript={review.transcript}
            />

            <EvaluatorCriteriaRubric
              scores={criteria}
              onChange={onCriteriaChange}
              readOnly={readOnly}
            />

            <section
              className={cn(
                evaluatorCard,
                evaluatorCardPad,
                "flex flex-col gap-6 lg:flex-row lg:items-start",
              )}
            >
              <EvaluatorOverallBand
                overall={overall}
                reviewStatus={review.status}
              />
              <div className="hidden min-w-0 flex-1 lg:block">
                <EvaluatorReviewActions
                  {...actionProps}
                  variant="feedback-only"
                />
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-4">
            <EvaluatorAiPrescore aiScores={review.ai_scores} />
            <EvaluatorStudentContext
              currentBand={review.student_current_band}
              targetBand={review.student_target_band}
            />

            <div className="hidden lg:block">
              <EvaluatorReviewActions {...actionProps} variant="actions-only" />
            </div>

            {readOnly ? (
              <p className="px-1 text-sm font-light text-[#5A6B82]">
                Completed
                {review.reviewed_at
                  ? ` · ${new Date(review.reviewed_at).toLocaleString()}`
                  : ""}
              </p>
            ) : null}
          </aside>
        </div>
      </div>

      <div className="lg:hidden">
        <EvaluatorReviewActions {...actionProps} sticky variant="full" />
      </div>
    </div>
  );
}
