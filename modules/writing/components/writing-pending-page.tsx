"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock3, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  mockTestNumberPath,
  shortModuleWritingResultsPath,
  testHubPath,
  writingModuleLabel,
} from "@/lib/mock-catalog";
import { appendPlanResultParams, type PlanResultContext } from "@/lib/plan-day-tasks";
import {
  usePlanResultsNav,
} from "@/components/bandforge/plan/plan-results-cta-bar";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { writingApi } from "@/modules/writing/services/writing-api";
import type { WritingSessionTask } from "@/modules/writing/types";
import { ResultPageViewport } from "@/modules/shared/components/result-page-viewport";
import { SectionResultsCtaBar } from "@/modules/shared/components/section-results";

const POLL_MS = 5_000;

type Props = {
  attemptId: string;
  testNumber: number;
  mockTestId: string;
  planFrom?: string | null;
  planTask?: string | null;
  planTaskId?: string | null;
  planHubId?: string | null;
};

function aiReady(status: string | null | undefined): boolean {
  return status === "ai_complete" || status === "ai_stub";
}

function aiPending(status: string | null | undefined): boolean {
  return status === "pending" || status == null;
}

export function WritingPendingPage({
  attemptId,
  testNumber,
  mockTestId,
  planFrom,
  planTask,
  planTaskId,
  planHubId,
}: Props) {
  const router = useRouter();
  const mockAttemptId = useResolvedMockAttemptId(mockTestId);
  const planCtx = useMemo(
    (): PlanResultContext | null =>
      planFrom === "plan"
        ? { task: planTask, taskId: planTaskId, hubId: planHubId }
        : null,
    [planFrom, planTask, planTaskId, planHubId],
  );
  const planNav = usePlanResultsNav(planCtx);
  const [message, setMessage] = useState<string | null>(null);
  const [humanBand, setHumanBand] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [aiBand, setAiBand] = useState<number | null>(null);
  const [sessionTasks, setSessionTasks] = useState<WritingSessionTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await writingApi.pending(attemptId);
      setMessage(data.message);
      setHumanBand(data.human_band);
      setAiStatus(data.ai_status ?? null);
      setAiBand(data.ai_band ?? null);
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
    const terminalAi = aiReady(aiStatus) || aiStatus === "ai_failed";
    if (humanBand != null && terminalAi) return;
    const timer = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [humanBand, aiStatus, load]);

  const scored = humanBand != null;
  const feedbackReady = scored || aiReady(aiStatus);
  const analyzing = !scored && aiPending(aiStatus);
  const aiFailed = !scored && aiStatus === "ai_failed";
  const sortedTasks = [...sessionTasks].toSorted((a, b) => a.part - b.part);
  const showTaskList = sortedTasks.length > 1;

  useEffect(() => {
    // Multi-task mock session: wait until all parts ready, then open preferred part.
    if (sessionTasks.length >= 2) {
      const sorted = [...sessionTasks].toSorted((a, b) => a.part - b.part);
      const allReady = sorted.every(
        (task) => task.human_band != null || aiReady(task.ai_status),
      );
      if (!allReady) return;
      const preferred = sorted.find((task) => task.part === 2) ?? sorted[0];
      if (!preferred) return;
      router.replace(
        appendPlanResultParams(
          shortModuleWritingResultsPath(testNumber, preferred.attempt_id, {
            mockAttemptId,
            part: preferred.part,
          }),
          planCtx,
        ),
      );
      return;
    }
    // Single task (solo / plan): auto-open full feedback when AI is ready.
    if (feedbackReady && !analyzing) {
      router.replace(
        appendPlanResultParams(
          shortModuleWritingResultsPath(testNumber, attemptId, {
            mockAttemptId,
          }),
          planCtx,
        ),
      );
    }
  }, [
    analyzing,
    attemptId,
    feedbackReady,
    mockAttemptId,
    planCtx,
    router,
    sessionTasks,
    testNumber,
  ]);

  const title = scored
    ? `Your Writing band is ${humanBand!.toFixed(1)}`
    : analyzing
      ? "Analyzing your essay…"
      : aiFailed
        ? "AI analysis unavailable"
        : "Your Writing score is on its way.";

  const footerActions =
    !loading && !error ? (
      <div className="flex w-full flex-col gap-2.5">
        {!showTaskList && feedbackReady ? (
          <Link
            href={appendPlanResultParams(
              shortModuleWritingResultsPath(testNumber, attemptId),
              planCtx,
            )}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-border bg-white px-5 py-3 text-body font-semibold text-ink hover:bg-cyan-soft/40"
          >
            {scored ? "View Writing Feedback" : "View AI Writing Feedback"}
          </Link>
        ) : null}
        {!showTaskList && analyzing && !planCtx ? (
          <Button variant="secondary" disabled className="min-h-[44px]">
            Analyzing essay…
          </Button>
        ) : null}

        {planNav ? (
          <SectionResultsCtaBar
            layout="stack"
            primaryLabel={planNav.continueLabel}
            onPrimary={() => router.push(planNav.continueHref)}
            primaryLoading={planNav.loading}
            primaryDisabled={planNav.loading}
            secondaryLabel={
              planNav.showSecondaryBack ? "Back to Today's plan" : undefined
            }
            onSecondary={
              planNav.showSecondaryBack
                ? () => router.push(planNav.todayHref)
                : undefined
            }
          />
        ) : (
          <>
            <Link
              href={testHubPath(mockTestId, null, testNumber)}
              className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg px-5 py-3 text-body font-semibold ${
                feedbackReady || showTaskList
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
          </>
        )}
      </div>
    ) : null;

  return (
    <ResultPageViewport
      centered={loading || Boolean(error)}
      footer={footerActions}
      unlockKey={`${loading}-${error}-${title}`}
      contentClassName="max-w-lg text-center"
    >
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
            className="mx-auto flex size-20 items-center justify-center rounded-full border border-teal/20 bg-cyan-soft"
            aria-hidden
          >
            {analyzing ? (
              <Loader2 className="size-9 animate-spin text-teal" />
            ) : (
              <Pencil className="size-9 text-teal" />
            )}
          </div>

          <p className="mt-6 text-meta font-semibold uppercase tracking-[0.14em] text-teal">
            Writing submitted
          </p>

          <h1 className="mt-2 font-display text-h2 text-navy">{title}</h1>

          <p className="mt-4 max-w-md text-body leading-relaxed text-ink/65">
            {scored
              ? (message ?? "Human reviewed — your band is now on Performance.")
              : (message ??
                "Our team is reviewing your essay against IELTS band descriptors. You will receive your band within 24 hours.")}
          </p>

          {scored ? (
            <p className="mt-4 text-sm font-semibold text-teal">Human reviewed</p>
          ) : analyzing ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink/70">
              <Loader2 className="size-4 animate-spin text-teal" aria-hidden />
              <span>AI analyzing your essay…</span>
            </div>
          ) : aiFailed ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink/70">
              <Clock3 className="size-4 text-teal" aria-hidden />
              <span>Examiner review · within 24 hours</span>
            </div>
          ) : (
            <div className="mt-6 inline-flex flex-col items-center gap-2">
              <span className="rounded-full border border-teal/30 bg-cyan-soft px-3 py-1 text-xs font-semibold text-teal">
                AI estimate{aiBand != null ? ` · ${aiBand.toFixed(1)}` : ""}
              </span>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink/70">
                <Clock3 className="size-4 text-teal" aria-hidden />
                <span>Human review · within 24 hours</span>
              </div>
            </div>
          )}

          {showTaskList ? (
            <section className="mt-8 w-full max-w-sm text-left">
              <h2 className="text-center text-[13px] font-bold uppercase tracking-wide text-ink/50">
                Your writing tasks
              </h2>
              <ul className="mt-3 space-y-2">
                {sortedTasks.map((task) => {
                  const taskScored = task.human_band != null;
                  const taskAiReady = aiReady(task.ai_status);
                  const taskAnalyzing = !taskScored && aiPending(task.ai_status);
                  const canView = taskScored || taskAiReady;
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
                            : taskAiReady
                              ? `AI ${task.ai_band?.toFixed(1) ?? "ready"}`
                              : taskAnalyzing
                                ? "Analyzing…"
                                : "Under review"}
                        </span>
                      </div>
                      {canView ? (
                        <Link
                          href={appendPlanResultParams(
                            shortModuleWritingResultsPath(
                              testNumber,
                              task.attempt_id,
                              { mockAttemptId, part: task.part },
                            ),
                            planCtx,
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
                      ) : (
                        <p className="mt-2 text-center text-[12px] text-ink/50">
                          {taskAnalyzing
                            ? "Feedback unlocks when AI finishes"
                            : "Waiting for examiner review"}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </ResultPageViewport>
  );
}
