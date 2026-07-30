"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import { BandForgeLogoMark } from "@/components/bandforge/bandforge-logo-link";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  getMockMeta,
  mockApiId,
  testNumberForMockId,
} from "@/lib/mock-catalog";
import {
  MOCK_COMPLETED_EXIT,
  useRedirectBrowserBack,
} from "@/lib/mock-completed-nav";
import { navigateAfterMockStart } from "@/lib/mock-exam-nav";
import { formatMockStartError } from "@/lib/api";
import {
  persistMockAttemptId,
  persistModuleResultAttempt,
} from "@/lib/exam-session-storage";
import { mockAttemptStorageKey } from "@/modules/mock/lib/mock-session-storage";
import {
  hasPendingMockResults,
  moduleResultStatusLabel,
  moduleSectionResultsHref,
  overallResultPresentation,
  shouldPollMockResults,
  type MockResultModule,
} from "@/modules/mock/lib/mock-result-presentation";
import {
  mockApi,
  type MockAttemptSummary,
  type MockModuleResultSource,
} from "@/modules/mock/services/mock-api";

const POLL_MS = 30_000;

type Props = {
  mockSlug: string;
  mockAttemptId: string;
  initialSummary?: MockAttemptSummary | null;
};

function bandLabel(band: number | null | undefined): string {
  if (band == null) return "—";
  return band.toFixed(1);
}

function formatCompleted(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

const MODULE_META = [
  {
    key: "listening" as const,
    label: "Listening",
    bandKey: "listening_band" as const,
    Icon: HeadphonesIcon,
    iconClass: "bg-cyan-soft text-teal",
  },
  {
    key: "reading" as const,
    label: "Reading",
    bandKey: "reading_band" as const,
    Icon: BookIcon,
    iconClass: "bg-[#EEF2FF] text-[#4338CA]",
  },
  {
    key: "writing" as const,
    label: "Writing",
    bandKey: "writing_band" as const,
    Icon: PencilIcon,
    iconClass: "bg-[#FEF3C7] text-[#B45309]",
  },
  {
    key: "speaking" as const,
    label: "Speaking",
    bandKey: "speaking_band" as const,
    Icon: MicIcon,
    iconClass: "bg-teal-soft text-teal",
  },
];

function statusTone(source: MockModuleResultSource): string {
  if (source === "failed") return "text-danger";
  if (source === "final") return "text-success";
  if (source === "ai_estimate") return "text-teal";
  if (source === "processing" || source === "awaiting_examiner") {
    return "text-warning";
  }
  return "text-muted";
}

function ModuleScoreCard({
  label,
  band,
  Icon,
  iconClass,
  status,
  source,
  href,
  onNavigate,
}: {
  label: string;
  band: string;
  Icon: typeof HeadphonesIcon;
  iconClass: string;
  status: string;
  source: MockModuleResultSource;
  href?: string | null;
  onNavigate?: () => void;
}) {
  const statusId = useId();
  const interactive = Boolean(href);
  const failed = source === "failed";

  const className = [
    "group relative flex min-h-[7.5rem] flex-col rounded-2xl border bg-white p-4 shadow-soft",
    "transition-colors duration-200 motion-reduce:transition-none",
    "touch-manipulation",
    interactive
      ? "cursor-pointer border-border-soft hover:border-cyan hover:bg-cyan-soft/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
      : "cursor-default border-border-soft opacity-80",
  ].join(" ");

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
            aria-hidden
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[15px] font-bold text-navy">{label}</p>
            <p
              id={statusId}
              className={`mt-0.5 flex items-center gap-1.5 text-[12px] font-semibold ${statusTone(source)}`}
            >
              <span
                className={`size-1.5 shrink-0 rounded-full ${
                  failed
                    ? "bg-danger"
                    : source === "final"
                      ? "bg-success"
                      : source === "ai_estimate"
                        ? "bg-teal"
                        : "bg-warning"
                }`}
                aria-hidden
              />
              <span>{status}</span>
            </p>
          </div>
        </div>
        {interactive ? (
          <span
            className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border-soft bg-surface-alt text-navy transition-colors duration-200 group-hover:border-cyan group-hover:bg-cyan group-hover:text-navy motion-reduce:transition-none"
            aria-hidden
          >
            <ArrowRight className="size-4" />
          </span>
        ) : null}
      </div>

      <p className="mt-4 font-mono text-[2rem] leading-none font-medium tabular-nums text-navy sm:text-[2.25rem]">
        {band}
      </p>
      <p className="mt-1.5 font-mono text-[10px] tracking-[0.12em] text-muted-light uppercase">
        Module band
      </p>
      {interactive ? (
        <span className="sr-only">Open {label} score report</span>
      ) : (
        <span className="sr-only">Score report unavailable for {label}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        aria-label={`${label}, band ${band}`}
        aria-describedby={statusId}
        onClick={onNavigate}
      >
        {body}
      </Link>
    );
  }

  return (
    <div
      className={className}
      role="group"
      aria-label={`${label}, band ${band}`}
      aria-describedby={statusId}
    >
      {body}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-11 w-11 animate-pulse rounded-full bg-border-muted motion-reduce:animate-none" />
      <div className="space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-border-muted motion-reduce:animate-none" />
        <div className="h-8 w-56 animate-pulse rounded bg-border-muted motion-reduce:animate-none" />
        <div className="h-4 w-40 animate-pulse rounded bg-border-muted motion-reduce:animate-none" />
      </div>
      <div className="h-40 animate-pulse rounded-[22px] bg-border-muted motion-reduce:animate-none" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[7.5rem] animate-pulse rounded-2xl bg-border-muted motion-reduce:animate-none"
          />
        ))}
      </div>
      <p className="sr-only">Loading mock results</p>
    </div>
  );
}

function MockResultsBody({
  mockSlug,
  mockAttemptId,
  initialSummary = null,
}: Props) {
  const { push, replace } = useRouter();
  const displayLabel = getMockMeta(mockSlug).displayLabel;
  const mockTestId = mockApiId(mockSlug);
  const testNumber = testNumberForMockId(mockTestId);
  const storageKey = mockAttemptStorageKey(mockTestId);
  const [loading, setLoading] = useState(!initialSummary);
  const [summary, setSummary] = useState<MockAttemptSummary | null>(
    initialSummary,
  );
  const [error, setError] = useState<string | null>(null);
  const [retestBusy, setRetestBusy] = useState(false);
  const [retestError, setRetestError] = useState<string | null>(null);

  useRedirectBrowserBack(MOCK_COMPLETED_EXIT);

  useEffect(() => {
    persistMockAttemptId(mockTestId, mockAttemptId);
  }, [mockAttemptId, mockTestId]);

  const startRetest = async () => {
    setRetestBusy(true);
    setRetestError(null);
    try {
      const res = await mockApi.start(mockTestId, true);
      sessionStorage.setItem(storageKey, res.mock_attempt_id);
      navigateAfterMockStart({ push, replace }, mockSlug, res);
    } catch (e) {
      const raw =
        e instanceof Error ? e.message : "Could not start a new attempt.";
      setRetestError(formatMockStartError(raw));
    } finally {
      setRetestBusy(false);
    }
  };

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let timer: number | null = null;
    let currentSummary = initialSummary;

    const clearPoll = () => {
      if (timer != null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const schedulePoll = (nextSummary: MockAttemptSummary) => {
      clearPoll();
      if (
        !active ||
        !shouldPollMockResults(nextSummary, document.visibilityState)
      ) {
        return;
      }
      timer = window.setTimeout(() => {
        void refresh();
      }, POLL_MS);
    };

    const refresh = async () => {
      if (inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const nextSummary = await mockApi.summary(mockAttemptId);
        if (!active) return;
        currentSummary = nextSummary;
        setSummary(nextSummary);
        setError(null);
        schedulePoll(nextSummary);
      } catch (e) {
        if (!active) return;
        setError(
          e instanceof Error ? e.message : "Could not load mock results.",
        );
        if (currentSummary) schedulePoll(currentSummary);
      } finally {
        inFlight = false;
        if (active) setLoading(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearPoll();
      } else if (!currentSummary || hasPendingMockResults(currentSummary)) {
        void refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (initialSummary) {
      schedulePoll(initialSummary);
    } else {
      void refresh();
    }

    return () => {
      active = false;
      clearPoll();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mockAttemptId, initialSummary]);

  const completedLabel = formatCompleted(summary?.completed_at);
  const overall = summary ? overallResultPresentation(summary) : null;
  const scoresHref = `/scores?fresh=1&mock=${encodeURIComponent(mockSlug)}`;

  return (
    <div className="min-h-dvh bg-[#F4F7FB] text-ink">
      <a
        href="#mock-results-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to results
      </a>

      <div className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6 sm:py-10">
        {loading ? (
          <ResultsSkeleton />
        ) : error && !summary ? (
          <div
            className="rounded-2xl border border-danger/20 bg-white p-6 shadow-soft"
            role="alert"
          >
            <h1 className="font-display text-lg font-bold text-navy">
              Couldn’t load results
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{error}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
              >
                Try again
              </button>
              <Link
                href={scoresHref}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border-muted bg-white px-4 text-sm font-semibold text-navy transition-colors duration-200 hover:border-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
              >
                Go to scores
              </Link>
            </div>
          </div>
        ) : summary ? (
          <>
            <header className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={scoresHref}
                  className="inline-flex size-11 cursor-pointer touch-manipulation items-center justify-center rounded-full border border-border-soft bg-white text-navy shadow-soft transition-colors duration-200 hover:border-cyan hover:bg-cyan-soft/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan motion-reduce:transition-none"
                  aria-label="Back to scores"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </Link>
                <BandForgeLogoMark size="sm" />
              </div>

              <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-teal uppercase">
                Mock complete · Test {testNumber}
              </p>
              <h1 className="mt-2 font-display text-[1.75rem] leading-tight font-bold text-navy sm:text-3xl">
                {displayLabel} results
              </h1>
              {completedLabel ? (
                <p className="mt-1.5 text-[13px] text-muted">
                  Finished {completedLabel}
                </p>
              ) : null}
              {error ? (
                <p
                  className="mt-2 rounded-xl border border-warning/25 bg-[#FEF8EC] px-3 py-2 text-[12px] text-[#92400E]"
                  role="status"
                >
                  Results refresh failed. We’ll keep trying while reviews are
                  pending.
                </p>
              ) : null}
            </header>

            <main id="mock-results-main" className="space-y-6">
              <section
                className="overflow-hidden rounded-[22px] border border-border-soft bg-navy px-5 py-6 text-white shadow-[0_20px_48px_rgba(13,31,60,0.22)] sm:px-7 sm:py-7"
                aria-label={overall?.label ?? "Overall band"}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.14em] text-[#7FE3EF] uppercase">
                      {overall?.label}
                    </p>
                    <p className="mt-2 font-mono text-[4.5rem] leading-[0.9] font-medium tabular-nums text-cyan sm:text-[5rem]">
                      {bandLabel(overall?.band)}
                    </p>
                  </div>
                  <p className="max-w-xs text-[13px] leading-relaxed text-[#D8E1EE] sm:text-right">
                    {overall?.description}
                  </p>
                </div>
                {hasPendingMockResults(summary) ? (
                  <p
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] text-[#D8E1EE]"
                    role="status"
                  >
                    <Loader2
                      className="size-3.5 animate-spin text-cyan motion-reduce:animate-none"
                      aria-hidden
                    />
                    Some modules are still updating
                  </p>
                ) : null}
              </section>

              <section aria-labelledby="module-scores-heading">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h2
                      id="module-scores-heading"
                      className="font-display text-base font-bold text-navy"
                    >
                      Module scores
                    </h2>
                    <p className="mt-0.5 text-[13px] text-muted">
                      Open any module for its full score report
                    </p>
                  </div>
                </div>

                <nav
                  aria-label="Module score reports"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  {MODULE_META.map(({ key, label, bandKey, Icon, iconClass }) => {
                    const result = summary.module_result_states[key];
                    const band = result?.band ?? summary[bandKey];
                    const source = result?.source ?? "unavailable";
                    const href = moduleSectionResultsHref(
                      mockTestId,
                      mockAttemptId,
                      key,
                      summary,
                    );

                    return (
                      <ModuleScoreCard
                        key={key}
                        label={label}
                        band={bandLabel(band)}
                        status={moduleResultStatusLabel(source, key)}
                        source={source}
                        Icon={Icon}
                        iconClass={iconClass}
                        href={href}
                        onNavigate={() => {
                          if (!href) return;
                          const attemptMatch = href.match(/[?&]attempt=([^&]+)/);
                          const attemptId = attemptMatch
                            ? decodeURIComponent(attemptMatch[1])
                            : null;
                          if (attemptId) {
                            persistModuleResultAttempt(
                              testNumber,
                              key as MockResultModule,
                              attemptId,
                            );
                          }
                          persistMockAttemptId(mockTestId, mockAttemptId);
                        }}
                      />
                    );
                  })}
                </nav>
              </section>

              <section
                className="space-y-3 border-t border-border-soft pt-6"
                aria-label="Next actions"
              >
                <Link
                  href={scoresHref}
                  className="inline-flex min-h-12 w-full cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-2xl bg-cyan px-5 text-[15px] font-bold text-navy shadow-[0_8px_20px_rgba(0,151,167,0.28)] transition-colors duration-200 hover:bg-cyan/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy motion-reduce:transition-none"
                >
                  View full performance
                  <ArrowRight className="size-4" aria-hidden />
                </Link>

                {retestError ? (
                  <p
                    className="rounded-xl border border-danger/20 bg-[#FEF2F2] px-3 py-2.5 text-[13px] text-danger"
                    role="alert"
                  >
                    {retestError}
                  </p>
                ) : null}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={retestBusy}
                    onClick={() => void startRetest()}
                    className="inline-flex min-h-12 cursor-pointer touch-manipulation items-center justify-center rounded-2xl border border-border-muted bg-white px-5 text-[14px] font-bold text-navy transition-colors duration-200 hover:border-cyan hover:bg-cyan-soft/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                  >
                    {retestBusy ? "Starting…" : `Retake ${displayLabel}`}
                  </button>
                  <Link
                    href={MOCK_COMPLETED_EXIT}
                    className="inline-flex min-h-12 cursor-pointer touch-manipulation items-center justify-center rounded-2xl px-5 text-[14px] font-semibold text-muted transition-colors duration-200 hover:bg-white hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan motion-reduce:transition-none"
                  >
                    Go to dashboard
                  </Link>
                </div>
              </section>
            </main>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function MockResults(props: Props) {
  return <MockResultsBody key={props.mockAttemptId} {...props} />;
}
