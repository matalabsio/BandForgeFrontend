"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import {
  persistModuleResultAttempt,
  readModuleResultAttempt,
} from "@/lib/exam-session-storage";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import { SpeakingFeedbackView } from "@/modules/speaking/components/speaking-feedback-view";
import { buildSpeakingFeedback } from "@/modules/speaking/lib/build-speaking-feedback";
import type {
  SpeakingPendingPayload,
  SpeakingReportPayload,
} from "@/modules/speaking/types";

type Props = {
  testNumber: number;
  attemptFromQuery?: string;
  targetBand?: number | null;
};

export function SpeakingResultsClient({
  testNumber,
  attemptFromQuery,
  targetBand = null,
}: Props) {
  const queryAttempt = attemptFromQuery?.trim() || null;
  const [attemptId, setAttemptId] = useState<string | null>(queryAttempt);
  const [pending, setPending] = useState<SpeakingPendingPayload | null>(null);
  const [report, setReport] = useState<SpeakingReportPayload | null>(null);
  const [loading, setLoading] = useState(Boolean(queryAttempt));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromSession = readModuleResultAttempt(testNumber, "speaking");
    const next = queryAttempt || fromSession;
    setAttemptId(next);
  }, [queryAttempt, testNumber]);

  useEffect(() => {
    if (attemptId) {
      persistModuleResultAttempt(testNumber, "speaking", attemptId);
    }
  }, [attemptId, testNumber]);

  useEffect(() => {
    if (!attemptId) {
      setPending(null);
      setReport(null);
      setLoading(false);
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

        if (pendingData.human_band == null) {
          setReport(null);
          return;
        }

        try {
          const reportData = await speakingApi.report(attemptId);
          if (!cancelled) setReport(reportData);
        } catch (e) {
          if (cancelled) return;
          if (e instanceof ApiError && e.status === 409) {
            setReport(null);
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
  }, [attemptId]);

  if (loading) {
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

  if (pending.human_band == null || !report) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface p-8 text-center">
        <p className="text-[14px] text-ink/70">
          Your speaking response is still under human review.
        </p>
        <p className="mt-2 max-w-md text-[13px] text-ink/60">
          {pending.message ||
            "Please check back shortly. We will publish your verified band once review is complete."}
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

  const feedback = buildSpeakingFeedback(report, { targetBand });
  return <SpeakingFeedbackView testNumber={testNumber} feedback={feedback} />;
}
