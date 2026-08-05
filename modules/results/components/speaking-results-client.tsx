"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  persistModuleResultAttempt,
  readMockAttemptId,
  readModuleResultAttempt,
} from "@/lib/exam-session-storage";
import { mockTestIdForNumber } from "@/lib/mock-catalog";
import {
  resolveSectionResultsBackFallbackHref,
  resolveSectionResultsBackHref,
} from "@/lib/section-results-back";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import { SpeakingFeedbackView } from "@/modules/speaking/components/speaking-feedback-view";
import { SpeakingAiEstimateView } from "@/modules/speaking/components/speaking-ai-estimate-view";
import {
  buildSpeakingFeedback,
  SpeakingReportContractError,
} from "@/modules/speaking/lib/build-speaking-feedback";
import {
  speakingPendingPath,
  speakingReportIsAvailable,
  speakingStatusPath,
} from "@/modules/speaking/lib/speaking-status-routing";
import type {
  SpeakingPendingPayload,
  SpeakingReportPayload,
} from "@/modules/speaking/types";
import type { PlanResultContext } from "@/lib/plan-day-tasks";
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

  useEffect(() => {
    if (attemptId) {
      persistModuleResultAttempt(testNumber, "speaking", attemptId);
    }
  }, [attemptId, testNumber]);

  useEffect(() => {
    if (!attemptId) {
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const pendingData = await speakingApi.pending(attemptId);
        if (cancelled) return;
        setPending(pendingData);

        if (!speakingReportIsAvailable(pendingData)) {
          setReport(null);
          if (
            pendingData.score_source !== "ai_estimate" ||
            pendingData.ai_band == null
          ) {
            router.replace(speakingStatusPath(testNumber, attemptId, pendingData));
          }
          return;
        }

        try {
          const reportData = await speakingApi.report(attemptId);
          if (cancelled) return;
          if (!speakingReportIsAvailable(reportData)) {
            setReport(null);
            router.replace(speakingPendingPath(testNumber, attemptId));
            return;
          }
          setReport(reportData);
        } catch (e) {
          if (cancelled) return;
          if (e instanceof ApiError && e.status === 409) {
            setReport(null);
            router.replace(speakingPendingPath(testNumber, attemptId));
            return;
          }
          throw e;
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Could not load speaking feedback.",
          );
          setPending(null);
          setReport(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [attemptId, router, testNumber]);

  if (!hydrated || (attemptId && loading)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-ink/60">
        Loading your speaking feedback…
      </div>
    );
  }

  if (!attemptId || !pending) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface p-8 text-center">
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
      </div>
    );
  }

  if (!speakingReportIsAvailable(pending) || !report) {
    if (pending.score_source === "ai_estimate" && pending.ai_band != null) {
      return (
        <SpeakingAiEstimateView
          testNumber={testNumber}
          payload={pending}
          targetBand={targetBand}
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
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface p-8 text-center">
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
        {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
        <Link
          href={`/test/${testNumber}/speaking/pending?attempt=${encodeURIComponent(attemptId)}`}
          className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-cyan"
        >
          Open pending status
        </Link>
      </div>
    );
  }

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
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface p-8 text-center" role="alert" aria-live="assertive">
        <h1 className="font-display text-xl font-bold text-navy">Report details unavailable</h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">{mappingMessage}</p>
        <Link href="/dashboard" className="mt-5 inline-flex min-h-11 cursor-pointer items-center font-semibold text-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan">
          Back to dashboard
        </Link>
      </div>
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
