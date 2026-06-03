"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  HeadphonesIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  MOCK_DISPLAY_LABEL,
  mockApiId,
} from "@/lib/mock-catalog";
import {
  MOCK_COMPLETED_EXIT,
  useRedirectBrowserBack,
} from "@/lib/mock-completed-nav";
import { navigateAfterMockStart } from "@/lib/mock-exam-nav";
import { formatMockStartError } from "@/lib/api";
import { mockAttemptStorageKey } from "@/modules/mock/lib/mock-session-storage";
import {
  mockApi,
  type MockAttemptSummary,
} from "@/modules/mock/services/mock-api";

type Props = {
  mockSlug: string;
  mockAttemptId: string;
  initialSummary?: MockAttemptSummary | null;
};

function bandLabel(band: number | null | undefined): string {
  if (band == null || band <= 0) return "—";
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
    accent: "from-sky-500/15 to-sky-600/5 text-sky-700",
  },
  {
    key: "reading" as const,
    label: "Reading",
    bandKey: "reading_band" as const,
    Icon: BookIcon,
    accent: "from-violet-500/15 to-violet-600/5 text-violet-700",
  },
  {
    key: "writing" as const,
    label: "Writing",
    bandKey: "writing_band" as const,
    Icon: PencilIcon,
    accent: "from-amber-500/15 to-amber-600/5 text-amber-800",
  },
];

function ModuleScoreCard({
  label,
  band,
  hint,
  Icon,
  accent,
}: {
  label: string;
  band: string;
  hint?: string;
  Icon: typeof HeadphonesIcon;
  accent: string;
}) {
  return (
    <div
      className={`flex min-w-[9.5rem] flex-1 flex-col rounded-2xl border border-[var(--exam-border)] bg-gradient-to-br ${accent} p-4 shadow-sm sm:min-w-0`}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
          <Icon className="size-4" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">
          {label}
        </p>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums sm:text-4xl">
        {band}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] font-medium opacity-70">{hint}</p>
      ) : null}
    </div>
  );
}

function MockResultsBody({
  mockSlug,
  mockAttemptId,
  initialSummary = null,
}: Props) {
  const { push, replace } = useRouter();
  const mockTestId = mockApiId(mockSlug);
  const storageKey = mockAttemptStorageKey(mockTestId);
  const [loading, setLoading] = useState(!initialSummary);
  const [summary, setSummary] = useState<MockAttemptSummary | null>(
    initialSummary,
  );
  const [error, setError] = useState<string | null>(null);
  const [retestBusy, setRetestBusy] = useState(false);
  const [retestError, setRetestError] = useState<string | null>(null);

  useRedirectBrowserBack(MOCK_COMPLETED_EXIT);

  const startRetest = async () => {
    setRetestBusy(true);
    setRetestError(null);
    try {
      const res = await mockApi.start(mockTestId, true);
      sessionStorage.setItem(storageKey, res.mock_attempt_id);
      navigateAfterMockStart({ push, replace }, mockSlug, res);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Could not start a new attempt.";
      setRetestError(formatMockStartError(raw));
    } finally {
      setRetestBusy(false);
    }
  };

  useEffect(() => {
    if (initialSummary) return;
    setLoading(true);
    setError(null);
    void mockApi
      .summary(mockAttemptId)
      .then((s) => {
        setSummary(s);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load mock results.");
        setLoading(false);
      });
  }, [mockAttemptId, initialSummary]);

  const completedLabel = formatCompleted(summary?.completed_at);

  return (
    <div className="min-h-dvh bg-[var(--exam-surface,#f8fafc)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="bf-dash-enter mx-auto w-full max-w-lg">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded bg-[var(--exam-border)]" />
            <div className="h-40 rounded-3xl bg-[var(--exam-border)]" />
            <div className="flex gap-3">
              <div className="h-28 flex-1 rounded-2xl bg-[var(--exam-border)]" />
              <div className="h-28 flex-1 rounded-2xl bg-[var(--exam-border)]" />
              <div className="h-28 flex-1 rounded-2xl bg-[var(--exam-border)]" />
            </div>
          </div>
        ) : error ? (
          <p className="text-[14px] text-red-600" role="alert">
            {error}
          </p>
        ) : summary ? (
          <>
            <header className="text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--exam-accent)]">
                Mock complete
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold text-[var(--exam-ink)] sm:text-3xl">
                {MOCK_DISPLAY_LABEL} results
              </h1>
              {completedLabel ? (
                <p className="mt-1 text-[13px] text-[var(--exam-ink-muted)]">
                  Finished {completedLabel}
                </p>
              ) : null}
            </header>

            <div className="relative mt-8 overflow-hidden rounded-3xl border border-[var(--exam-border)] bg-gradient-to-br from-[var(--exam-bar,#0f172a)] via-[#1e293b] to-[#0f766e] p-6 text-center text-white shadow-lg sm:p-8 sm:text-left">
              <div
                className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl"
                aria-hidden
              />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/65">
                Overall band
              </p>
              <p className="mt-2 font-display text-6xl font-bold tabular-nums sm:text-7xl">
                {bandLabel(summary.aggregate_band)}
              </p>
              <p className="mx-auto mt-3 max-w-xs text-[13px] leading-relaxed text-white/75 sm:mx-0">
                Average of Listening, Reading, and Writing for this attempt.
              </p>
            </div>

            <div className="mt-6 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              {MODULE_META.map(({ key, label, bandKey, Icon, accent }) => {
                const band = summary[bandKey];
                const mod = summary.modules.find((m) => m.module === key);
                let hint: string | undefined;
                if (key === "writing" && band == null) {
                  hint =
                    mod?.status === "completed"
                      ? "Submitted"
                      : "Not completed";
                } else if (key === "writing" && band != null) {
                  hint = "Word-count estimate";
                }
                return (
                  <div key={key} className="snap-start sm:snap-align-none">
                    <ModuleScoreCard
                      label={label}
                      band={bandLabel(band)}
                      hint={hint}
                      Icon={Icon}
                      accent={accent}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/scores?fresh=1"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--exam-accent)] px-5 py-3.5 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#0891B2]"
              >
                View full performance
                <span aria-hidden>→</span>
              </Link>
              <p className="text-center text-[12px] leading-relaxed text-[var(--exam-ink-muted)] sm:text-left">
                Section breakdown, past attempts, and progress charts live on
                your Performance page.
              </p>

              {retestError ? (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800"
                  role="alert"
                >
                  {retestError}
                </p>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  disabled={retestBusy}
                  onClick={() => void startRetest()}
                  className="cursor-pointer rounded-xl border border-[var(--exam-border)] bg-white px-5 py-3 text-[14px] font-bold text-[var(--exam-ink)] shadow-sm transition-colors hover:border-[var(--exam-accent)] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
                >
                  {retestBusy ? "Starting…" : `Retake ${MOCK_DISPLAY_LABEL}`}
                </button>
                <Link
                  href={MOCK_COMPLETED_EXIT}
                  className="inline-flex items-center justify-center rounded-xl border border-transparent px-5 py-3 text-[14px] font-semibold text-[var(--exam-ink-muted)] transition-colors hover:text-[var(--exam-ink)] sm:flex-1"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function MockResults(props: Props) {
  return <MockResultsBody key={props.mockAttemptId} {...props} />;
}
