"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { persistModuleResultAttempt, readModuleResultAttempt } from "@/lib/exam-session-storage";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import { SpeakingFeedbackView } from "@/modules/speaking/components/speaking-feedback-view";

type Props = {
  testNumber: number;
  attemptFromQuery?: string;
};

type SpeakingResultData = {
  status: string;
  review_status: string;
  human_band: number | null;
  submitted_at: string | null;
  student_name: string | null;
  message: string;
};

export function SpeakingResultsClient({ testNumber, attemptFromQuery }: Props) {
  const queryAttempt = attemptFromQuery?.trim() || null;
  const [attemptId, setAttemptId] = useState<string | null>(queryAttempt);
  const [result, setResult] = useState<SpeakingResultData | null>(null);
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
      setResult(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await speakingApi.pending(attemptId);
        if (!cancelled) setResult(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load speaking feedback.");
          setResult(null);
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

  if (!attemptId || !result) {
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

  if (result.human_band == null) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface p-8 text-center">
        <p className="text-[14px] text-ink/70">
          Your speaking response is still under human review.
        </p>
        <p className="mt-2 max-w-md text-[13px] text-ink/60">
          {result.message || "Please check back shortly. We will publish your verified band once review is complete."}
        </p>
        <Link
          href={`/test/${testNumber}/speaking/pending?attempt=${encodeURIComponent(attemptId)}`}
          className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-cyan"
        >
          Open pending status
        </Link>
      </div>
    );
  }

  return (
    <SpeakingFeedbackView
      testNumber={testNumber}
      studentName={result.student_name}
      humanBand={result.human_band}
      submittedAt={result.submitted_at}
      reviewerMessage={result.message}
    />
  );
}
