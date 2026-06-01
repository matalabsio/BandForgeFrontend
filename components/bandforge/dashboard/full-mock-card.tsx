"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon, ClockIcon } from "@/components/bandforge/dashboard/icons";
import { DashboardCard } from "@/components/bandforge/dashboard/dashboard-card";
import {
  DEFAULT_MOCK_SLUG,
  M01_MOCK_TEST_ID,
  MOCK_DISPLAY_FLOW_HINT,
  MOCK_DISPLAY_LABEL,
  MOCK_DISPLAY_SUBTITLE,
  TEST1_TOTAL_MINUTES,
  mockHubPath,
  mockResultsPath,
} from "@/lib/mock-catalog";
import { clearMockExamLocalData } from "@/lib/mock-client-session";
import { navigateAfterMockStart, navigateFromProgress } from "@/lib/mock-exam-nav";
import { useMockSession } from "@/modules/mock/hooks/use-mock-session";
import { ModuleProgressChips } from "@/modules/mock/components/module-progress-chips";

import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";

type Props = {
  title?: string;
  initialProgress?: MockAttemptProgress | null;
};

export function FullMockCard({
  title = MOCK_DISPLAY_LABEL,
  initialProgress = null,
}: Props) {
  const { push, replace } = useRouter();
  const nav = { push, replace };
  const { progress, loading, busy, error, start } = useMockSession(
    M01_MOCK_TEST_ID,
    { initialProgress },
  );

  const handlePrimary = async () => {
    if (progress?.status === "completed" && progress.mock_attempt_id) {
      push(mockResultsPath(DEFAULT_MOCK_SLUG, progress.mock_attempt_id));
      return;
    }

    if (progress?.status === "in_progress" && progress.mock_attempt_id) {
      if (progress.next_module) {
        navigateFromProgress(
          nav,
          DEFAULT_MOCK_SLUG,
          progress.mock_attempt_id,
          progress,
        );
        return;
      }
    }

    try {
      const res = await start(false);
      navigateAfterMockStart(nav, DEFAULT_MOCK_SLUG, res);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "";
      if (raw.includes("complete") || raw.includes("retake")) {
        if (progress?.mock_attempt_id) {
          push(mockResultsPath(DEFAULT_MOCK_SLUG, progress.mock_attempt_id));
          return;
        }
      }
      push(mockHubPath(DEFAULT_MOCK_SLUG));
    }
  };

  const handleNewAttempt = async () => {
    clearMockExamLocalData(M01_MOCK_TEST_ID);
    try {
      const res = await start(true);
      navigateAfterMockStart(nav, DEFAULT_MOCK_SLUG, res);
    } catch {
      push(mockHubPath(DEFAULT_MOCK_SLUG));
    }
  };

  const primaryLabel =
    progress?.status === "completed"
      ? "View results"
      : progress?.status === "in_progress"
        ? `Resume ${MOCK_DISPLAY_LABEL}`
        : `Start ${MOCK_DISPLAY_LABEL}`;

  const showNewAttempt =
    progress?.status === "in_progress" || progress?.status === "completed";

  return (
    <DashboardCard className="relative overflow-hidden">
      <div className="absolute left-0 top-0 h-1 w-full bg-[#06B6D4]" />
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-md bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {MOCK_DISPLAY_LABEL}
          </span>
          <h2 className="mt-3 font-display text-xl font-bold leading-snug text-[#0F172A] sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#0F172A]/55">
            {MOCK_DISPLAY_SUBTITLE}
          </p>
          <p className="mt-2 text-[13px] text-[#0F172A]/55">{MOCK_DISPLAY_FLOW_HINT}</p>

          {!loading ? (
            <div className="mt-4">
              <ModuleProgressChips modules={progress?.modules} />
            </div>
          ) : (
            <p className="mt-4 text-[12px] text-[#0F172A]/45">Loading progress…</p>
          )}

          <ul className="mt-3 flex flex-wrap gap-3 text-[11px] font-medium text-[#0F172A]/50">
            <li className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5 text-[#06B6D4]" />
              ~{TEST1_TOTAL_MINUTES} min
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePrimary()}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-[#06B6D4] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#0891B2] disabled:opacity-60"
            >
              {primaryLabel}
              <ArrowRightIcon className="size-4" />
            </button>
            {showNewAttempt ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleNewAttempt()}
                className="inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-[#0F172A]/10 px-4 py-2.5 text-[13px] font-semibold text-[#0891B2] hover:border-[#06B6D4]/30 hover:bg-[#06B6D4]/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Starting…" : "New attempt"}
              </button>
            ) : null}
          </div>
          {error ? (
            <p className="mt-2 text-[13px] text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </DashboardCard>
  );
}
