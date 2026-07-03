"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockTestNumberPath, testHubPath } from "@/lib/mock-catalog";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import { TestShell } from "@/modules/shared";

const POLL_MS = 30_000;

type Props = {
  attemptId: string;
  testNumber: number;
  mockTestId: string;
};

export function SpeakingPendingPage({ attemptId, testNumber, mockTestId }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [humanBand, setHumanBand] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await speakingApi.pending(attemptId);
      setMessage(data.message);
      setStudentName(data.student_name);
      setHumanBand(data.human_band);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load submission status.");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (humanBand != null) return;
    const timer = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [humanBand, load]);

  const scored = humanBand != null;

  return (
    <TestShell>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-12 text-center md:px-8">
        {loading ? (
          <p className="text-body text-ink/60" aria-busy>
            Loading your submission…
          </p>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-body text-danger" role="alert">
              {error}
            </p>
            <Button variant="secondary" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div
              className="flex size-20 items-center justify-center rounded-full border border-teal/20 bg-cyan-soft"
              aria-hidden
            >
              <Mic className="size-9 text-teal" />
            </div>

            <p className="mt-6 text-meta font-semibold uppercase tracking-[0.14em] text-teal">
              Speaking submitted
            </p>

            <h1 className="mt-2 font-display text-h2 text-navy">
              {scored
                ? `Your Speaking band is ${humanBand!.toFixed(1)}`
                : "Your Speaking score is on its way."}
            </h1>

            {studentName ? (
              <p className="mt-2 text-body text-ink/70">
                Submission recorded for{" "}
                <span className="font-semibold text-navy">{studentName}</span>
              </p>
            ) : null}

            <p className="mt-4 max-w-md text-body leading-relaxed text-ink/65">
              {scored
                ? (message ?? "Human reviewed — your band is now on Performance.")
                : (message ??
                  "Our team is reviewing your recording against IELTS band descriptors. You will receive your band within 24 hours.")}
            </p>

            {!scored ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink/70">
                <Clock3 className="size-4 text-teal" aria-hidden />
                <span>Human review · within 24 hours</span>
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold text-teal">Human reviewed</p>
            )}

            <div className="mt-10 flex w-full max-w-xs flex-col gap-2">
              {scored ? (
                <Link
                  href={`/test/${testNumber}/speaking/results?attempt=${encodeURIComponent(attemptId)}`}
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-teal px-5 py-3 text-body font-semibold text-white hover:bg-cyan-light"
                >
                  View Speaking Feedback
                </Link>
              ) : null}
              <Link
                href={testHubPath(mockTestId, null, testNumber)}
                className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg px-5 py-3 text-body font-semibold ${
                  scored
                    ? "border border-border bg-surface text-ink hover:bg-cyan-soft/40"
                    : "bg-teal text-white hover:bg-cyan-light"
                }`}
              >
                Back to test hub
              </Link>
              <Link
                href={mockTestNumberPath(testNumber)}
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-border bg-surface px-5 py-3 text-body font-semibold text-ink hover:bg-cyan-soft/40"
              >
                View all sections
              </Link>
            </div>
          </>
        )}
      </main>
    </TestShell>
  );
}
