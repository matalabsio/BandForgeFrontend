"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  persistModuleResultAttempt,
  readMockAttemptId,
  readModuleResultAttempt,
} from "@/lib/exam-session-storage";
import { mockTestIdForNumber } from "@/lib/mock-catalog";
import { appendPlanResultParams, type PlanResultContext } from "@/lib/plan-day-tasks";
import {
  resolveSectionResultsBackFallbackHref,
  resolveSectionResultsBackHref,
} from "@/lib/section-results-back";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import { SpeakingFeedbackView } from "@/modules/speaking/components/speaking-feedback-view";
import { ResultPageViewport } from "@/modules/shared/components/result-page-viewport";
import { SpeakingAiEstimateView } from "@/modules/speaking/components/speaking-ai-estimate-view";
import { SpeakingInsufficientSpeechView } from "@/modules/speaking/components/speaking-insufficient-speech-view";
import { isInsufficientSpeechPayload } from "@/modules/speaking/lib/meaningful-speech";
import {
  buildSpeakingFeedback,
  SpeakingReportContractError,
} from "@/modules/speaking/lib/build-speaking-feedback";
import {
  isSpeakingAiFailed,
  isSpeakingAiReady,
  isSpeakingAnalyzing,
  shouldPollSpeakingPending,
  speakingPendingPath,
  speakingReportIsAvailable,
} from "@/modules/speaking/lib/speaking-status-routing";
import type {
  SpeakingPendingPayload,
  SpeakingReportPayload,
} from "@/modules/speaking/types";
import { usePlanResultsNav } from "@/components/bandforge/plan/plan-results-cta-bar";

type Props = {
  testNumber: number;
  mockTestId?: string;
  attemptFromQuery?: string;
  targetBand?: number | null;
  mockAttemptId?: string | null;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  plan?: PlanResultContext | null;
};

const POLL_MS = 4_000;

const subscribeToHydration = () => () => {};

export function SpeakingResultsClient({
  testNumber,
  mockTestId: mockTestIdProp,
  attemptFromQuery,
  targetBand = null,
  mockAttemptId = null,
  primaryActionLabel: primaryActionLabelProp,
  onPrimaryAction: onPrimaryActionProp,
  secondaryActionLabel: secondaryActionLabelProp,
  onSecondaryAction: onSecondaryActionProp,
  plan = null,
}: Props) {
  const router = useRouter();
  const planNav = usePlanResultsNav(plan);
  const primaryActionLabel =
    primaryActionLabelProp ?? planNav?.continueLabel;
  const onPrimaryAction =
    onPrimaryActionProp ??
    (planNav ? () => router.push(planNav.continueHref) : undefined);
  const secondaryActionLabel =
    secondaryActionLabelProp ??
    (planNav?.showSecondaryBack ? "Back to Today's plan" : undefined);
  const onSecondaryAction =
    onSecondaryActionProp ??
    (planNav?.showSecondaryBack
      ? () => router.push(planNav.todayHref)
      : undefined);
  const mockTestId = mockTestIdProp ?? mockTestIdForNumber(testNumber);
  const queryAttempt = attemptFromQuery?.trim() || null;
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const storedAttempt = useSyncExternalStore(
    subscribeToHydration,
    () => readModuleResultAttempt(testNumber, "speaking"),
    () => null,
  );
  const storedMockAttempt = useSyncExternalStore(
    subscribeToHydration,
    () => readMockAttemptId(mockTestId),
    () => null,
  );
  const attemptId = queryAttempt || storedAttempt;
  const [pending, setPending] = useState<SpeakingPendingPayload | null>(null);
  const [report, setReport] = useState<SpeakingReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedMockAttemptId =
    mockAttemptId?.trim() ||
    report?.attempt?.mock_attempt_id?.trim() ||
    storedMockAttempt ||
    null;

  const backNav = useMemo(
    () =>
      resolveSectionResultsBackHref({
        testNumber,
        mockAttemptId: resolvedMockAttemptId,
      }),
    [resolvedMockAttemptId, testNumber],
  );
  const fallbackHref = resolveSectionResultsBackFallbackHref(testNumber);

  const examinerStatusHref = useMemo(() => {
    if (!attemptId) return undefined;
    return appendPlanResultParams(
      speakingPendingPath(testNumber, attemptId, resolvedMockAttemptId),
      plan,
    );
  }, [attemptId, plan, resolvedMockAttemptId, testNumber]);

  useEffect(() => {
    if (attemptId) {
      persistModuleResultAttempt(testNumber, "speaking", attemptId);
    }
  }, [attemptId, testNumber]);

  const load = useCallback(async () => {
    if (!attemptId) return;
    try {
      const pendingData = await speakingApi.pending(attemptId);
      setPending(pendingData);
      setError(null);

      if (speakingReportIsAvailable(pendingData)) {
        try {
          const reportData = await speakingApi.report(attemptId);
          if (speakingReportIsAvailable(reportData)) {
            setReport(reportData);
          } else {
            setReport(null);
          }
        } catch (e) {
          if (e instanceof ApiError && e.status === 409) {
            setReport(null);
          } else {
            throw e;
          }
        }
      } else {
        setReport(null);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load speaking feedback.",
      );
      setPending(null);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void load();
  }, [attemptId, load]);

  useEffect(() => {
    if (!pending || !attemptId) return;
    if (!shouldPollSpeakingPending(pending)) return;
    const timer = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [attemptId, load, pending]);

  if (!hydrated || (loading && !pending)) {
    return (
      <ResultPageViewport centered unlockKey="loading">
        <p className="text-sm text-ink/60">Loading your speaking feedback…</p>
      </ResultPageViewport>
    );
  }

  if (!attemptId || (error && !pending)) {
    return (
      <ResultPageViewport centered unlockKey={`missing-${error}`}>
        <p className="text-[14px] text-ink/70">
          Open this result from your dashboard or after finishing speaking.
        </p>
        {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
        <Link
          href={`/test/${testNumber}/speaking`}
          className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-cyan"
        >
          Back to speaking
        </Link>
      </ResultPageViewport>
    );
  }

  if (!pending) return null;

  if (report && speakingReportIsAvailable(pending)) {
    let feedback = null;
    let mappingMessage = "";
    try {
      feedback = buildSpeakingFeedback(report);
    } catch (mappingError) {
      mappingMessage =
        mappingError instanceof SpeakingReportContractError
          ? mappingError.message
          : "This speaking report could not be displayed safely.";
    }
    if (!feedback) {
      return (
        <ResultPageViewport centered unlockKey="mapping-error" contentClassName="text-center">
          <h1 className="font-display text-xl font-bold text-navy">Report details unavailable</h1>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">{mappingMessage}</p>
          <Link href="/dashboard" className="mt-5 inline-flex min-h-11 cursor-pointer items-center font-semibold text-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan">
            Back to dashboard
          </Link>
        </ResultPageViewport>
      );
    }
    return (
      <SpeakingFeedbackView
        testNumber={testNumber}
        feedback={feedback}
        primaryActionLabel={primaryActionLabel}
        onPrimaryAction={onPrimaryAction}
        secondaryActionLabel={secondaryActionLabel}
        onSecondaryAction={onSecondaryAction}
        backHref={backNav.href}
        backLabel={backNav.label}
        fallbackHref={fallbackHref}
      />
    );
  }

  if (isInsufficientSpeechPayload(pending)) {
    return (
      <SpeakingInsufficientSpeechView
        testNumber={testNumber}
        payload={pending}
        reRecordHref={`/test/${testNumber}/speaking`}
        primaryActionLabel={primaryActionLabel}
        onPrimaryAction={onPrimaryAction}
        secondaryActionLabel={secondaryActionLabel}
        onSecondaryAction={onSecondaryAction}
        backHref={backNav.href}
        backLabel={backNav.label}
        fallbackHref={fallbackHref}
      />
    );
  }

  if (isSpeakingAiFailed(pending)) {
    return (
      <ResultPageViewport centered unlockKey="ai-failed" contentClassName="max-w-lg text-center">
        <h1 className="font-display text-h2 text-navy">AI analysis unavailable</h1>
        <p className="mt-4 text-body text-ink/65">
          {pending.message ||
            "We could not score this speaking attempt right now. Your recordings were saved and remain queued for examiner review."}
        </p>
        {primaryActionLabel && onPrimaryAction ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-teal px-5 py-3 font-semibold text-white"
          >
            {primaryActionLabel}
          </button>
        ) : (
          <Link
            href={backNav.href}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-teal px-5 py-3 font-semibold text-white"
          >
            {backNav.label}
          </Link>
        )}
        {examinerStatusHref ? (
          <Link
            href={examinerStatusHref}
            className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-cyan"
          >
            Examiner review status
          </Link>
        ) : null}
      </ResultPageViewport>
    );
  }

  if (isSpeakingAnalyzing(pending)) {
    return (
      <ResultPageViewport centered unlockKey={`analyzing-${pending.ai_status}`} contentClassName="max-w-lg text-center">
        <Loader2 className="mx-auto size-10 animate-spin text-teal" aria-hidden />
        <p className="mt-6 text-meta font-semibold uppercase tracking-[0.14em] text-teal">
          Speaking submitted
        </p>
        <h1 className="mt-2 font-display text-h2 text-navy">Transcribing and scoring…</h1>
        <p className="mt-4 text-body text-ink/65">
          Whisper transcription plus Speaking AI scoring. This usually takes one to
          two minutes.
        </p>
        {primaryActionLabel && onPrimaryAction ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-10 text-sm font-semibold text-ink/60 hover:underline"
          >
            Continue without waiting →
          </button>
        ) : null}
      </ResultPageViewport>
    );
  }

  if (isSpeakingAiReady(pending)) {
    return (
      <SpeakingAiEstimateView
        testNumber={testNumber}
        payload={pending}
        targetBand={targetBand}
        examinerStatusHref={examinerStatusHref}
        primaryActionLabel={primaryActionLabel}
        onPrimaryAction={onPrimaryAction}
        secondaryActionLabel={secondaryActionLabel}
        onSecondaryAction={onSecondaryAction}
        backHref={backNav.href}
        backLabel={backNav.label}
        fallbackHref={fallbackHref}
      />
    );
  }

  const withdrawn = pending.release_state === "withdrawn";
  return (
    <ResultPageViewport centered unlockKey={`unreleased-${withdrawn}`}>
      <p className="text-[14px] text-ink/70">
        {withdrawn
          ? "Your Speaking report is currently unavailable."
          : "Your speaking response is not released yet."}
      </p>
      <p className="mt-2 max-w-md text-[13px] text-ink/60">
        {pending.message ||
          (withdrawn
            ? "The report was withdrawn for review. It will reappear here only after it is approved and released again."
            : "Please check back shortly. We will publish your verified report once review is complete.")}
      </p>
      {examinerStatusHref ? (
        <Link
          href={examinerStatusHref}
          className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-cyan"
        >
          Examiner review status
        </Link>
      ) : null}
    </ResultPageViewport>
  );
}
