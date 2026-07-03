"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  mockTestNumberPath,
  shortModuleWritingResultsPath,
  testHubPath,
  writingModuleLabel,
} from "@/lib/mock-catalog";
import { writingApi } from "@/modules/writing/services/writing-api";
import type { WritingSessionTask } from "@/modules/writing/types";
import { TestShell } from "@/modules/shared";

const POLL_MS = 30_000;

type Props = {
  attemptId: string;
  testNumber: number;
  mockTestId: string;
};

export function WritingPendingPage({ attemptId, testNumber, mockTestId }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [humanBand, setHumanBand] = useState<number | null>(null);
  const [sessionTasks, setSessionTasks] = useState<WritingSessionTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await writingApi.pending(attemptId);
      setMessage(data.message);
      setHumanBand(data.human_band);
      setSessionTasks(data.session_tasks ?? []);
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
  const sortedTasks = [...sessionTasks].toSorted((a, b) => a.part - b.part);
  const showTaskList = sortedTasks.length > 1;

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
              <Pencil className="size-9 text-teal" />
            </div>

            <p className="mt-6 text-meta font-semibold uppercase tracking-[0.14em] text-teal">
              Writing submitted
            </p>

            <h1 className="mt-2 font-display text-h2 text-navy">
              {scored
                ? `Your Writing band is ${humanBand!.toFixed(1)}`
                : "Your Writing score is on its way."}
            </h1>

            <p className="mt-4 max-w-md text-body leading-relaxed text-ink/65">
              {scored
                ? (message ?? "Human reviewed — your band is now on Performance.")
                : (message ??
                  "Our team is reviewing your essay against IELTS band descriptors. You will receive your band within 24 hours.")}
            </p>

            {!scored ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink/70">
                <Clock3 className="size-4 text-teal" aria-hidden />
                <span>Human review · within 24 hours</span>
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold text-teal">Human reviewed</p>
            )}

            {showTaskList ? (
              <section className="mt-8 w-full max-w-sm text-left">
                <h2 className="text-center text-[13px] font-bold uppercase tracking-wide text-ink/50">
                  Your writing tasks
                </h2>
                <ul className="mt-3 space-y-2">
                  {sortedTasks.map((task) => {
                    const taskScored = task.human_band != null;
                    const isCurrent = task.attempt_id === attemptId;
                    return (
                      <li
                        key={task.attempt_id}
                        className="rounded-xl border border-border bg-surface px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[14px] font-semibold text-navy">
                            {writingModuleLabel(task.part)}
                          </p>
                          <span className="text-[12px] font-semibold tabular-nums text-teal">
                            {taskScored
                              ? `Band ${task.human_band!.toFixed(1)}`
                              : "Under review"}
                          </span>
                        </div>
                        <Link
                          href={shortModuleWritingResultsPath(
                            testNumber,
                            task.attempt_id,
                          )}
                          className={`mt-2 inline-flex min-h-[40px] w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-[13px] font-semibold ${
                            isCurrent
                              ? "bg-teal text-white hover:bg-cyan-light"
                              : "border border-border bg-white text-ink hover:bg-cyan-soft/40"
                          }`}
                        >
                          {taskScored
                            ? `View ${writingModuleLabel(task.part).replace("Writing · ", "")} feedback`
                            : `View AI ${writingModuleLabel(task.part).replace("Writing · ", "")} feedback`}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <div className="mt-10 flex w-full max-w-xs flex-col gap-2">
              {!showTaskList ? (
                <Link
                  href={shortModuleWritingResultsPath(testNumber, attemptId)}
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-teal px-5 py-3 text-body font-semibold text-white hover:bg-cyan-light"
                >
                  {scored ? "View Writing Feedback" : "View AI Writing Feedback"}
                </Link>
              ) : null}
              <Link
                href={testHubPath(mockTestId, null, testNumber)}
                className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg px-5 py-3 text-body font-semibold ${
                  scored || showTaskList
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
