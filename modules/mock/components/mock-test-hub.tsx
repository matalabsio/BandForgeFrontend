"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClockIcon } from "@/components/bandforge/dashboard/icons";
import {
  MOCK_DISPLAY_LABEL,
  examPathForMockStart,
  mockResultsPath,
  TEST1_TOTAL_MINUTES,
  mockPathFromProgress,
} from "@/lib/mock-catalog";
import { clearMockExamLocalData } from "@/lib/mock-client-session";
import { MockAttemptHistory } from "@/modules/mock/components/mock-attempt-history";
import { useMockSession } from "@/modules/mock/hooks/use-mock-session";
import { defaultModuleProgress } from "@/modules/mock/lib/mock-progress";
import { ModuleProgressChips } from "@/modules/mock/components/module-progress-chips";
import { Test1ModuleCards } from "@/modules/mock/components/test1-module-cards";
import { Test1ReadinessChecklist } from "@/modules/mock/components/test1-readiness-checklist";
import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";

type Props = {
  mockSlug: string;
  mockTestId: string;
  title?: string;
  initialProgress?: MockAttemptProgress | null;
};

export function MockTestHub({
  mockSlug,
  mockTestId,
  title = MOCK_DISPLAY_LABEL,
  initialProgress = null,
}: Props) {
  const { push, replace } = useRouter();
  const { mockAttemptId, progress, busy, error, start } = useMockSession(
    mockTestId,
    { initialProgress },
  );
  const [readinessReady, setReadinessReady] = useState(false);
  const onReadinessChange = useCallback((ready: boolean) => {
    setReadinessReady(ready);
  }, []);

  const showRetake = progress?.status === "completed";
  const startLabel = busy ? "Starting…" : `Start ${MOCK_DISPLAY_LABEL}`;
  const startDisabled = busy || !readinessReady;
  const hasAttempt = Boolean(progress?.mock_attempt_id ?? mockAttemptId);

  const ensureAttempt = async (forceNew = false) => {
    if (forceNew) {
      clearMockExamLocalData(mockTestId);
      await start(true);
      return;
    }
    if (progress?.mock_attempt_id) return;
    await start(false);
  };

  const handleStartOrRetake = async () => {
    try {
      await ensureAttempt(showRetake);
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

  const modules = progress?.modules ?? defaultModuleProgress();
  const activeAttemptId = progress?.mock_attempt_id ?? mockAttemptId;

  const resumeToCurrentModule = () => {
    if (!progress?.mock_attempt_id || !activeAttemptId) return;
    const url = mockPathFromProgress(mockSlug, activeAttemptId, progress);
    replace(url);
  };

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="bf-dash-enter mx-auto max-w-3xl">
        <p className="mb-4">
          <Link
            href="/dashboard"
            className="text-[12px] font-semibold text-[var(--exam-accent)] hover:underline"
          >
            ← Back to dashboard
          </Link>
        </p>

        <div className="rounded-xl border border-[var(--exam-border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--exam-accent)] px-3 py-1 text-[11px] font-bold text-white">
              Test 1
            </span>
            <span className="rounded-full border border-[var(--exam-border)] bg-[var(--exam-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--exam-ink-muted)]">
              Test 2
            </span>
            <span className="rounded-full border border-[var(--exam-border)] bg-[var(--exam-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--exam-ink-muted)]">
              Test 3
            </span>
          </div>

          {hasAttempt ? (
            <div className="mt-4">
              <ModuleProgressChips modules={modules} />
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[var(--exam-ink-muted)]">
            <ClockIcon className="size-3.5 text-[var(--exam-accent)]" />
            <span>~{TEST1_TOTAL_MINUTES} min live sections</span>
          </div>

          {error ? (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {progress?.status !== "completed" ? (
            <Test1ReadinessChecklist
              className="mt-5"
              onReadyChange={onReadinessChange}
            />
          ) : null}

          {!hasAttempt ? (
            <div className="mt-5">
              <button
                type="button"
                disabled={startDisabled}
                onClick={() => void handleStartOrRetake()}
                className="cursor-pointer rounded-xl bg-[var(--exam-accent)] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {startLabel}
              </button>
            </div>
          ) : progress?.status === "in_progress" ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={startDisabled}
                onClick={() => resumeToCurrentModule()}
                className="cursor-pointer rounded-xl bg-[var(--exam-accent)] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {startLabel}
              </button>
              <button
                type="button"
                disabled={busy || !readinessReady}
                onClick={() => void handleNewAttempt()}
                className="cursor-pointer rounded-xl border border-[var(--exam-border)] px-4 py-2.5 text-[13px] font-semibold text-[var(--exam-ink-muted)] hover:border-[var(--exam-ink-muted)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                New attempt
              </button>
            </div>
          ) : progress?.status === "completed" && activeAttemptId ? (
            <div className="mt-5 space-y-5">
              <button
                type="button"
                onClick={() =>
                  push(mockResultsPath(mockSlug, activeAttemptId))
                }
                className="cursor-pointer rounded-xl bg-[var(--exam-accent)] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0891B2]"
              >
                View results
              </button>
              <Test1ReadinessChecklist onReadyChange={onReadinessChange} />
              <button
                type="button"
                disabled={busy || !readinessReady}
                onClick={() => void handleNewAttempt()}
                className="cursor-pointer rounded-xl border border-[var(--exam-border)] px-4 py-2.5 text-[13px] font-semibold text-[var(--exam-ink-muted)] hover:border-[var(--exam-ink-muted)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                New attempt
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <Test1ModuleCards
            mockSlug={mockSlug}
            modules={modules}
            mockAttemptId={activeAttemptId}
            mockStatus={progress?.status}
          />
        </div>

        <MockAttemptHistory
          mockSlug={mockSlug}
          mockTestId={mockTestId}
          currentMockAttemptId={activeAttemptId}
        />
      </div>
    </div>
  );
}
