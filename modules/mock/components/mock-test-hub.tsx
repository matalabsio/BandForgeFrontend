"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClockIcon } from "@/components/bandforge/dashboard/icons";
import {
  examPathForMockStart,
  getMockMeta,
  getMockPanelSlotBySlug,
  mockResultsPath,
  mockPathFromProgress,
  type MockSlug,
} from "@/lib/mock-catalog";
import { MockTestHubShell } from "@/modules/mock/components/mock-test-hub-shell";
import { clearMockExamLocalData } from "@/lib/mock-client-session";
import { useMockSession } from "@/modules/mock/hooks/use-mock-session";
import { computeMockProgressPercent } from "@/modules/mock/lib/mock-progress";
import { Test1ModuleCards } from "@/modules/mock/components/test1-module-cards";
import { Test1ReadinessChecklist } from "@/modules/mock/components/test1-readiness-checklist";
import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";

const MockAttemptHistory = dynamic(
  () =>
    import("@/modules/mock/components/mock-attempt-history").then(
      (mod) => mod.MockAttemptHistory,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-[12px] text-[var(--exam-ink-muted)]">Loading history…</p>
    ),
  },
);

type Props = {
  mockSlug: MockSlug;
  mockTestId: string;
  title?: string;
  initialProgress?: MockAttemptProgress | null;
};

export function MockTestHub({
  mockSlug,
  mockTestId,
  title,
  initialProgress = null,
}: Props) {
  const meta = getMockMeta(mockSlug);
  const panelSlot = getMockPanelSlotBySlug(mockSlug);
  const displayLabel = title ?? meta.displayLabel;
  const examTitle = panelSlot?.examTitle ?? displayLabel;
  const { push, replace } = useRouter();
  const { mockAttemptId, progress, busy, error, start } = useMockSession(
    mockTestId,
    { initialProgress },
  );
  const [readinessReady, setReadinessReady] = useState(false);
  const onReadinessChange = useCallback((ready: boolean) => {
    setReadinessReady(ready);
  }, []);

  const status = progress?.status;
  const hasAttempt = Boolean(progress?.mock_attempt_id ?? mockAttemptId);
  const activeAttemptId = progress?.mock_attempt_id ?? mockAttemptId;
  const percent = useMemo(
    () => computeMockProgressPercent(progress?.modules ?? []),
    [progress?.modules],
  );

  const showReadiness = !hasAttempt || status === "completed";
  const showNewAttempt = status === "in_progress" || status === "completed";

  const primaryLabel =
    busy
      ? "Please wait…"
      : status === "completed"
        ? "View results"
        : status === "in_progress"
          ? `Resume ${displayLabel}`
          : `Start ${displayLabel}`;

  const ensureAttempt = async (forceNew = false) => {
    if (forceNew) {
      clearMockExamLocalData(mockTestId);
      await start(true);
      return;
    }
    if (progress?.mock_attempt_id) return;
    await start(false);
  };

  const handlePrimary = async () => {
    if (status === "completed" && activeAttemptId) {
      push(mockResultsPath(mockSlug, activeAttemptId));
      return;
    }
    if (status === "in_progress" && activeAttemptId) {
      const url = mockPathFromProgress(mockSlug, activeAttemptId, progress!);
      replace(url);
      return;
    }
    try {
      await ensureAttempt(false);
    } catch {
      /* error surfaced via hook */
    }
  };

  const handleNewAttempt = async () => {
    try {
      clearMockExamLocalData(mockTestId);
      const res = await start(true);
      replace(examPathForMockStart(mockSlug, res));
    } catch {
      /* error surfaced via hook */
    }
  };

  const primaryNeedsReadiness =
    showReadiness && status !== "completed" && status !== "in_progress";
  const primaryDisabled = busy || (primaryNeedsReadiness && !readinessReady);
  const newAttemptDisabled = busy || !readinessReady;

  return (
    <MockTestHubShell activeNumber={panelSlot?.number ?? 1}>
      <section className="overflow-hidden rounded-2xl border border-[var(--exam-border)] bg-white shadow-sm">
        <div className="border-b border-[var(--exam-border)] bg-gradient-to-br from-slate-50/90 to-white px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--exam-accent)]">
                {displayLabel}
              </p>
              <h1 className="mt-1 font-display text-lg font-bold leading-snug text-[var(--exam-ink)] sm:text-xl">
                {examTitle}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--exam-ink-muted)]">
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="size-3.5 text-[var(--exam-accent)]" />
                  ~{meta.totalMinutes} min
                </span>
                <span>·</span>
                <span>L · R · W</span>
              </p>
            </div>
            {hasAttempt ? (
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums leading-none text-[var(--exam-accent)]">
                  {percent}%
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--exam-ink-muted)]">
                  Complete
                </p>
              </div>
            ) : null}
          </div>

          {hasAttempt ? (
            <div
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--exam-border)]"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[var(--exam-accent)] transition-[width] duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {showReadiness ? (
            <Test1ReadinessChecklist onReadyChange={onReadinessChange} />
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={primaryDisabled}
              onClick={() => void handlePrimary()}
              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-xl bg-[var(--exam-accent)] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryLabel}
            </button>
            {showNewAttempt ? (
              <button
                type="button"
                disabled={newAttemptDisabled}
                onClick={() => void handleNewAttempt()}
                className="inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-[var(--exam-border)] px-4 py-2.5 text-[13px] font-semibold text-[var(--exam-ink-muted)] hover:border-[var(--exam-ink-muted)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                New attempt
              </button>
            ) : null}
          </div>

          {!hasAttempt ? (
            <p className="text-[12px] leading-relaxed text-[var(--exam-ink-muted)]">
              After you start, Listening, Reading, and Writing sections unlock below
              in sequence.
            </p>
          ) : null}
        </div>
      </section>

      <Test1ModuleCards
        mockSlug={mockSlug}
        modules={progress?.modules ?? []}
        mockAttemptId={activeAttemptId}
        mockStatus={status}
      />

      {hasAttempt ? (
        <MockAttemptHistory
          mockSlug={mockSlug}
          mockTestId={mockTestId}
          currentMockAttemptId={activeAttemptId}
        />
      ) : null}
    </MockTestHubShell>
  );
}
