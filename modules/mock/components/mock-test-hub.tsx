"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClockIcon } from "@/components/bandforge/dashboard/icons";
import {
  getMockMeta,
  mockResultsPath,
  testNumberForMockId,
  type MockSlug,
} from "@/lib/mock-catalog";
import {
  navigateAfterMockStart,
  navigateFromProgress,
  navigateToModuleExam,
} from "@/lib/mock-exam-nav";
import type { MockCatalogSlot } from "@/lib/mock-catalog-api";
import { MockTestHubShell } from "@/modules/mock/components/mock-test-hub-shell";
import { clearMockExamLocalData } from "@/lib/mock-client-session";
import { persistMockAttemptId } from "@/lib/exam-session-storage";
import { getSubscription } from "@/lib/payments";
import { useMockSession } from "@/modules/mock/hooks/use-mock-session";
import { computeMockProgressPercent, formatModuleAbbrev, resolveEnabledModuleKeys } from "@/modules/mock/lib/mock-progress";
import { Test1ModuleCards } from "@/modules/mock/components/test1-module-cards";
import { Test1ReadinessChecklist } from "@/modules/mock/components/test1-readiness-checklist";
import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";
import type { MockModuleKey } from "@/modules/mock/lib/mock-progress";
import { cn } from "@/lib/utils";

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

export type MockHubMeta = {
  displayLabel: string;
  examTitle: string;
  listeningPartCount: number;
  readingPassageCount: number;
  writingTaskCount: number;
  listeningMinutes: number;
  readingMinutes: number;
  writingMinutes: number;
  totalMinutes: number;
  flowHint: string;
  modulesEnabled?: string[];
};

type Props = {
  mockSlug: MockSlug | string;
  mockTestId: string;
  title?: string;
  hubMeta?: MockHubMeta;
  /** Catalog slot number (1–5) for test switcher highlight (page variant only). */
  testNumber?: number;
  catalogSlots?: MockCatalogSlot[];
  initialProgress?: MockAttemptProgress | null;
  /** `embedded` omits the outer shell (used on unified `/test`). */
  variant?: "page" | "embedded";
  requiresSubscription?: boolean;
};

export function MockTestHub({
  mockSlug,
  mockTestId,
  title,
  hubMeta,
  testNumber = 1,
  catalogSlots,
  initialProgress = null,
  variant = "embedded",
  requiresSubscription = false,
}: Props) {
  const legacyMeta = hubMeta ? null : getMockMeta(mockSlug as MockSlug);
  const meta = hubMeta ?? legacyMeta!;
  const displayLabel = title ?? meta.displayLabel;
  const examTitle = hubMeta?.examTitle ?? displayLabel;
  const { push, replace } = useRouter();
  const { mockAttemptId, progress, busy, error, start } = useMockSession(
    mockTestId,
    { initialProgress },
  );
  const [readinessReady, setReadinessReady] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(!requiresSubscription);
  const onReadinessChange = useCallback((ready: boolean) => {
    setReadinessReady(ready);
  }, []);

  useEffect(() => {
    if (!requiresSubscription) return;
    getSubscription()
      .then((sub) => setHasSubscription(Boolean(sub.is_active)))
      .catch(() => setHasSubscription(false));
  }, [requiresSubscription]);

  const subscriptionLocked = requiresSubscription && !hasSubscription;

  const status = progress?.status;
  const hasAttempt = Boolean(progress?.mock_attempt_id ?? mockAttemptId);
  const activeAttemptId = progress?.mock_attempt_id ?? mockAttemptId;
  const percent = useMemo(
    () => computeMockProgressPercent(progress?.modules ?? []),
    [progress?.modules],
  );

  const moduleAbbrev = useMemo(() => {
    const mods = progress?.modules ?? [];
    const enabled = resolveEnabledModuleKeys(
      mods,
      hubMeta?.modulesEnabled,
    );
    return formatModuleAbbrev(enabled);
  }, [progress?.modules, hubMeta?.modulesEnabled]);

  const displayTotalMinutes = useMemo(() => {
    const mods = progress?.modules ?? [];
    const enabled = mods.filter((mod) => mod.is_enabled);
    if (enabled.length > 0) {
      return enabled.reduce((sum, mod) => sum + (mod.duration_minutes ?? 0), 0);
    }
    return meta.totalMinutes;
  }, [progress?.modules, meta.totalMinutes]);

  const showReadiness = !hasAttempt || status === "completed";
  const showNewAttempt = status === "in_progress" || status === "completed";

  const primaryLabel =
    busy
      ? "Please wait…"
      : status === "completed"
        ? "View results"
        : status === "in_progress"
          ? "Resume test"
          : "Start test";

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
      persistMockAttemptId(mockTestId, activeAttemptId);
      push(mockResultsPath(mockSlug, activeAttemptId));
      return;
    }
    if (status === "in_progress" && activeAttemptId) {
      navigateFromProgress(
        { push, replace },
        mockSlug,
        activeAttemptId,
        progress!,
      );
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
      navigateAfterMockStart({ push, replace }, mockSlug, res, { replace: true });
    } catch {
      /* error surfaced via hook */
    }
  };

  const handleStartModule = useCallback(
    async (module: MockModuleKey) => {
      if (subscriptionLocked) return;
      try {
        let attemptId = activeAttemptId;
        if (!attemptId) {
          const res = await start(false);
          attemptId = res.mock_attempt_id;
        }
        if (!attemptId) return;
        persistMockAttemptId(mockTestId, attemptId);
        navigateToModuleExam({ push, replace }, testNumber, module, {
          part: 1,
          passage: 1,
          auto: true,
          sectionStart: true,
          mockAttemptId: attemptId,
        });
      } catch {
        /* error surfaced via hook */
      }
    },
    [
      activeAttemptId,
      mockTestId,
      push,
      replace,
      start,
      subscriptionLocked,
      testNumber,
    ],
  );

  const primaryNeedsReadiness =
    showReadiness && status !== "completed" && status !== "in_progress";
  const primaryDisabled =
    busy || subscriptionLocked || (primaryNeedsReadiness && !readinessReady);
  const newAttemptDisabled = busy || subscriptionLocked || !readinessReady;

  const flowDescription =
    meta.flowHint ||
    `Listening (${meta.listeningPartCount} parts) → Reading (${meta.readingPassageCount} passages) → Writing (${meta.writingTaskCount} tasks). ~${meta.totalMinutes} minutes total.`;

  const content = (
    <>
      {subscriptionLocked ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Premium mock test</p>
          <p className="mt-1 text-[13px]">
            An active subscription is required for Test 2.{" "}
            <Link href="/pricing" className="font-semibold text-cyan underline">
              View plans
            </Link>
          </p>
        </div>
      ) : null}
      <article className="relative overflow-hidden rounded-2xl bg-ink p-5 text-white shadow-lg sm:p-6 md:hidden">
        <div
          className="pointer-events-none absolute -right-2 top-4 size-24 rounded-full border-2 border-[var(--exam-accent)]/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-8 top-10 size-14 rounded-2xl border-2 border-[var(--exam-accent)]/20"
          aria-hidden
        />

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--exam-accent)]">
          Featured · {displayLabel}
        </p>
        <h2 className="mt-2 text-xl font-bold leading-snug">{examTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{flowDescription}</p>

        {hasAttempt ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Progress</span>
              <span className="font-bold tabular-nums text-white">{percent}%</span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[var(--exam-accent)]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
            {error}
          </p>
        ) : null}

        {showReadiness && status !== "in_progress" ? (
          <Test1ReadinessChecklist
            onReadyChange={onReadinessChange}
            variant="dark"
            className="mt-4"
          />
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={primaryDisabled}
            onClick={() => void handlePrimary()}
            className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-full bg-[var(--exam-accent)] px-6 text-sm font-semibold text-white hover:bg-[var(--exam-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {primaryLabel}
          </button>
          {showNewAttempt ? (
            <button
              type="button"
              disabled={newAttemptDisabled}
              onClick={() => void handleNewAttempt()}
              className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              New attempt
            </button>
          ) : null}
        </div>
      </article>

      <section className="hidden overflow-hidden rounded-2xl border border-[var(--exam-border)] bg-white shadow-sm md:block">
        <div className="border-b border-[var(--exam-border)] bg-gradient-to-br from-slate-50/90 to-white px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--exam-accent)]">
                {displayLabel}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold leading-snug text-[var(--exam-ink)]">
                {examTitle}
              </h2>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--exam-ink-muted)]">
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="size-3.5 text-[var(--exam-accent)]" />
                  ~{displayTotalMinutes} min
                </span>
                <span>·</span>
                <span>{moduleAbbrev}</span>
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
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--exam-border)]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-[var(--exam-accent)] transition-[width] duration-300" style={{ width: `${percent}%` }} />
            </div>
          ) : null}
        </div>
        <div className="space-y-5 p-6">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800" role="alert">
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
              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-full bg-[var(--exam-accent)] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[var(--exam-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
      </section>

      <Test1ModuleCards
        mockSlug={mockSlug}
        moduleMeta={hubMeta ?? undefined}
        modules={progress?.modules ?? []}
        mockAttemptId={activeAttemptId}
        mockStatus={status}
        showSectionFilters
        previewWhenLocked={!hasAttempt}
        catalogModulesEnabled={hubMeta?.modulesEnabled}
        onStartModule={handleStartModule}
        startModuleBusy={busy}
      />

      {hasAttempt ? (
        <div className={cn("hidden md:block")}>
          <MockAttemptHistory
            mockSlug={mockSlug}
            mockTestId={mockTestId}
            currentMockAttemptId={activeAttemptId}
          />
        </div>
      ) : null}
    </>
  );

  if (variant === "embedded") {
    return content;
  }

  return (
    <MockTestHubShell
      activeNumber={testNumber}
      title={examTitle}
      catalogSlots={catalogSlots}
    >
      {content}
    </MockTestHubShell>
  );
}
