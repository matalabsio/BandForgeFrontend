"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BrainCircuit,
  Check,
  Clock3,
  FileAudio,
  Loader2,
  Mic,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockTestNumberPath, testHubPath } from "@/lib/mock-catalog";
import { appendPlanResultParams, type PlanResultContext } from "@/lib/plan-day-tasks";
import { usePlanResultsNav } from "@/components/bandforge/plan/plan-results-cta-bar";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import {
  shouldNavigateToSpeakingReport,
  shouldPollSpeakingRelease,
  speakingReportPath,
  speakingStatusPath,
} from "@/modules/speaking/lib/speaking-status-routing";
import type {
  SpeakingPendingPayload,
  SpeakingReleaseState,
} from "@/modules/speaking/types";
import { ResultPageViewport } from "@/modules/shared/components/result-page-viewport";
import { SectionResultsCtaBar } from "@/modules/shared/components/section-results";

const POLL_MS = 30_000;
const AI_READY_STATUSES = new Set(["ai_complete", "ai_stub", "insufficient_speech"]);
const AI_FAILED_STATUSES = new Set([
  "ai_failed",
  "evaluation_failed",
  "failed",
  "error",
]);

type Props = {
  attemptId: string;
  testNumber: number;
  mockTestId: string;
  mockAttemptId?: string | null;
  planFrom?: string | null;
  planTask?: string | null;
  planTaskId?: string | null;
  planHubId?: string | null;
};

export function SpeakingPendingPage({
  attemptId,
  testNumber,
  mockTestId,
  mockAttemptId = null,
  planFrom,
  planTask,
  planTaskId,
  planHubId,
}: Props) {
  const router = useRouter();
  const planCtx = useMemo(
    (): PlanResultContext | null =>
      planFrom === "plan"
        ? { task: planTask, taskId: planTaskId, hubId: planHubId }
        : null,
    [planFrom, planTask, planTaskId, planHubId],
  );
  const planNav = usePlanResultsNav(planCtx);
  const aiResultsHref = useMemo(
    () =>
      appendPlanResultParams(
        speakingReportPath(testNumber, attemptId, mockAttemptId),
        planCtx,
      ),
    [attemptId, mockAttemptId, planCtx, testNumber],
  );
  const [payload, setPayload] = useState<SpeakingPendingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);
  const inFlightRef = useRef(false);
  const navigatedRef = useRef(false);
  const payloadRef = useRef<SpeakingPendingPayload | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const loadRef = useRef<() => Promise<void>>(async () => {});

  const clearPoll = useCallback(() => {
    if (pollTimerRef.current != null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const schedulePoll = useCallback(
    (state: SpeakingReleaseState) => {
      clearPoll();
      if (
        !mountedRef.current ||
        document.visibilityState === "hidden" ||
        !shouldPollSpeakingRelease(state)
      ) {
        return;
      }
      pollTimerRef.current = window.setTimeout(() => {
        void loadRef.current();
      }, POLL_MS);
    },
    [clearPoll],
  );

  const load = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError(null);
    if (!payloadRef.current) setLoading(true);
    let nextState: SpeakingReleaseState | null = null;
    const controller = new AbortController();
    activeRequestRef.current = controller;
    try {
      const data = await speakingApi.pending(attemptId, { signal: controller.signal });
      if (!mountedRef.current) return;
      payloadRef.current = data;
      nextState = data.release_state;
      setPayload(data);
      if (shouldNavigateToSpeakingReport(data, navigatedRef.current)) {
        navigatedRef.current = true;
        router.replace(
          appendPlanResultParams(
            speakingStatusPath(testNumber, attemptId, data),
            planCtx,
          ),
        );
      }
    } catch (e) {
      if (!mountedRef.current) return;
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Could not load submission status.");
      nextState = payloadRef.current?.release_state ?? null;
    } finally {
      if (activeRequestRef.current === controller) activeRequestRef.current = null;
      inFlightRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
        if (nextState) schedulePoll(nextState);
      }
    }
  }, [attemptId, planCtx, router, schedulePoll, testNumber]);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    mountedRef.current = true;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearPoll();
        return;
      }
      void loadRef.current();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (document.visibilityState !== "hidden") void loadRef.current();
    return () => {
      mountedRef.current = false;
      clearPoll();
      activeRequestRef.current?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearPoll]);

  const state = payload?.release_state;
  const stateCopy = {
    processing: {
      eyebrow: "Speaking submitted",
      title: "Processing your recording",
      fallback:
        "We’re preparing your recording for examiner review. This page will update automatically.",
      badge: "Preparing examiner materials",
      icon: <Loader2 className="size-9 animate-spin text-teal motion-reduce:animate-none" />,
    },
    awaiting_examiner: {
      eyebrow: "Examiner review",
      title: "Your recording is awaiting review",
      fallback:
        "A qualified examiner will review your response against IELTS band descriptors.",
      badge: "Examiner review · within 24 hours",
      icon: <Clock3 className="size-9 text-teal" />,
    },
    released: {
      eyebrow: "Feedback released",
      title: "Your Speaking feedback is ready",
      fallback: "Your approved Speaking report is ready to view.",
      badge: "Examiner approved",
      icon: <BadgeCheck className="size-9 text-teal" />,
    },
    withdrawn: {
      eyebrow: "Feedback unavailable",
      title: "Your Speaking report was withdrawn",
      fallback:
        "The report is temporarily unavailable while it is reviewed. This page will update if it is released again.",
      badge: "Report under review",
      icon: <ShieldAlert className="size-9 text-teal" />,
    },
  } as const;
  const copy = state ? stateCopy[state] : null;
  const reportReady =
    payload?.release_state === "released" && payload.report_available === true;
  const transcription = payload?.transcription_progress;
  const transcriptionTotal = transcription?.total ?? 0;
  const transcriptionTerminal =
    (transcription?.completed ?? 0) + (transcription?.failed ?? 0);
  const transcriptionDone =
    transcriptionTotal > 0 && transcriptionTerminal >= transcriptionTotal;
  const transcriptionStarted =
    transcriptionTotal > 0 &&
    ((transcription?.processing ?? 0) > 0 ||
      (transcription?.completed ?? 0) > 0 ||
      (transcription?.failed ?? 0) > 0);
  const aiStatus = payload?.ai_status ?? "";
  const aiInsufficient =
    aiStatus === "insufficient_speech" ||
    payload?.score_source === "insufficient_speech";
  const aiReady =
    aiInsufficient ||
    (AI_READY_STATUSES.has(aiStatus) &&
      payload?.score_source === "ai_estimate" &&
      payload.ai_band != null);
  const aiFailed = AI_FAILED_STATUSES.has(aiStatus);
  const timeline = payload
    ? [
        {
          label: "Recording submitted",
          detail: "All answers were received securely.",
          status: "done" as const,
          icon: FileAudio,
        },
        {
          label: "Transcribing responses",
          detail:
            transcriptionTotal > 0
              ? `${Math.min(transcriptionTerminal, transcriptionTotal)} of ${transcriptionTotal} responses processed${
                  (transcription?.failed ?? 0) > 0
                    ? ` · ${transcription?.failed} unavailable`
                    : ""
                }.`
              : "Preparing your response audio for transcription.",
          status: transcriptionDone
            ? ("done" as const)
            : transcriptionStarted || state === "processing"
              ? ("active" as const)
              : ("pending" as const),
          icon: Mic,
        },
        {
          label: aiFailed ? "AI analysis needs retry" : "AI analysis prepared",
          detail: aiFailed
            ? "The automated evaluation could not finish. Your recording is safe and the evaluation can be retried."
            : "Response evidence and fluency metrics are prepared for the examiner.",
          status: aiFailed
            ? ("failed" as const)
            : aiReady
              ? ("done" as const)
              : transcriptionDone
                ? ("active" as const)
                : ("pending" as const),
          icon: aiFailed ? ShieldAlert : BrainCircuit,
        },
        {
          label: state === "withdrawn" ? "Examiner re-review" : "Examiner review",
          detail: "A human examiner confirms the final IELTS Speaking band.",
          status:
            state === "released"
              ? ("done" as const)
              : state === "awaiting_examiner" || state === "withdrawn"
                ? ("active" as const)
                : ("pending" as const),
          icon: UserCheck,
        },
        {
          label: "Feedback released",
          detail: "Your private Speaking report becomes available.",
          status: reportReady ? ("done" as const) : ("pending" as const),
          icon: BadgeCheck,
        },
      ]
    : [];

  const footerActions =
    payload && copy ? (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-2.5">
        {reportReady ? (
          <Link
            href={aiResultsHref}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-border bg-white px-5 py-3 text-body font-semibold text-ink hover:bg-cyan-soft/40"
          >
            View Speaking Feedback
          </Link>
        ) : aiReady ? (
          <Link
            href={aiResultsHref}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-border bg-white px-5 py-3 text-body font-semibold text-ink hover:bg-cyan-soft/40"
          >
            {aiInsufficient ? "Back to result" : "Back to AI result"}
          </Link>
        ) : null}

        {planNav ? (
          <>
            <SectionResultsCtaBar
              layout="stack"
              primaryLabel={planNav.continueLabel}
              onPrimary={planNav.onContinue}
              primaryLoading={planNav.loading}
              primaryDisabled={planNav.loading}
              secondaryLabel={
                planNav.showSecondaryBack ? "Back to Today's plan" : undefined
              }
              onSecondary={
                planNav.showSecondaryBack ? planNav.goToday : undefined
              }
            />
            {planNav.finishModal}
          </>
        ) : (
          <>
            <Link
              href={testHubPath(mockTestId, null, testNumber)}
              className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg px-5 py-3 text-body font-semibold ${
                reportReady || aiReady
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
      centered={(loading && !payload) || Boolean(error && !payload)}
      footer={footerActions}
      unlockKey={`${loading}-${error}-${state}`}
      contentClassName="max-w-3xl"
    >
        {loading && !payload ? (
          <p className="text-center text-body text-ink/60" aria-busy>
            Loading your submission…
          </p>
        ) : error && !payload ? (
          <div className="space-y-4 text-center">
            <p className="text-body text-danger" role="alert">
              {error}
            </p>
            <Button
              variant="secondary"
              onClick={() => void load()}
              aria-label="Retry loading speaking submission status"
            >
              Try again
            </Button>
          </div>
        ) : payload && copy ? (
          <div className="rounded-[22px] border border-navy/10 bg-white p-5 shadow-[0_18px_50px_rgba(13,31,60,0.09)] sm:p-8">
            <div className="text-center" role="status" aria-live="polite" aria-atomic="true" key={state}>
              <div
                className="mx-auto flex size-20 items-center justify-center rounded-full border border-teal/20 bg-cyan-soft"
                aria-hidden
              >
                {copy.icon ?? <Mic className="size-9 text-teal" />}
              </div>
              <p className="mt-6 text-meta font-semibold uppercase tracking-[0.14em] text-teal">
                {copy.eyebrow}
              </p>
              <h1 className="mt-2 font-display text-h2 text-navy">{copy.title}</h1>
              {payload.student_name ? (
                <p className="mt-2 text-body text-ink/70">
                  Submission recorded for{" "}
                  <span className="font-semibold text-navy">{payload.student_name}</span>
                </p>
              ) : null}
              <p className="mt-4 max-w-md text-body leading-relaxed text-ink/65">
                {payload.message || copy.fallback}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink/70">
                <span>{copy.badge}</span>
              </div>
            </div>

            <ol className="mx-auto mt-9 max-w-xl" aria-label="Speaking feedback progress">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === timeline.length - 1;
                return (
                  <li key={item.label} className="relative flex min-h-[76px] gap-4 text-left">
                    {!isLast ? (
                      <span
                        className={cn(
                          "absolute left-[21px] top-11 h-[calc(100%-2px)] w-px",
                          item.status === "done"
                            ? "bg-teal/50"
                            : item.status === "failed"
                              ? "bg-danger/35"
                              : "bg-navy/12",
                        )}
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className={cn(
                        "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border",
                        item.status === "done"
                          ? "border-teal bg-teal text-white"
                          : item.status === "failed"
                            ? "border-danger/40 bg-red-50 text-danger"
                            : item.status === "active"
                              ? "border-cyan bg-cyan/10 text-teal ring-4 ring-cyan/10"
                              : "border-navy/12 bg-slate-50 text-slate-400",
                      )}
                      aria-hidden
                    >
                      {item.status === "done" ? (
                        <Check className="size-5" />
                      ) : item.status === "active" ? (
                        <Loader2 className="size-5 motion-safe:animate-spin" />
                      ) : (
                        <Icon className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0 pb-5 pt-1">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          item.status === "pending" ? "text-ink/50" : "text-navy",
                          item.status === "failed" && "text-danger",
                        )}
                      >
                        {item.label}
                        {item.status === "active" ? (
                          <span className="sr-only">, in progress</span>
                        ) : null}
                        {item.status === "done" ? (
                          <span className="sr-only">, complete</span>
                        ) : null}
                        {item.status === "failed" ? (
                          <span className="sr-only">, failed and recoverable</span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#5A6B82] sm:text-sm">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {error ? (
              <div className="mt-6 space-y-3 text-center" role="alert">
                <p className="text-sm text-danger">Status refresh failed: {error}</p>
                <Button
                  variant="secondary"
                  onClick={() => void load()}
                  aria-label="Retry refreshing speaking submission status"
                >
                  Retry status check
                </Button>
              </div>
            ) : null}

            {aiFailed && !error ? (
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={() => void load()}
                  aria-label="Check speaking AI evaluation status again"
                >
                  Check again
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
    </ResultPageViewport>
  );
}
