"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, ClockIcon } from "@/components/bandforge/dashboard/icons";
import { DashboardCard } from "@/components/bandforge/dashboard/dashboard-card";
import {
  getMockMeta,
  getMockPanelSlotBySlug,
  mockResultsPath,
  testHubPath,
  type MockSlug,
} from "@/lib/mock-catalog";
import { clearMockExamLocalData } from "@/lib/mock-client-session";
import { persistMockAttemptId } from "@/lib/exam-session-storage";
import { useMockSession } from "@/modules/mock/hooks/use-mock-session";
import { ModuleProgressChips } from "@/modules/mock/components/module-progress-chips";

import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";

type Props = {
  mockSlug: MockSlug;
  title?: string;
  description?: string | null;
  initialProgress?: MockAttemptProgress | null;
};

export function FullMockCard({
  mockSlug,
  title,
  description,
  initialProgress = null,
}: Props) {
  const meta = getMockMeta(mockSlug);
  const panelSlot = getMockPanelSlotBySlug(mockSlug);
  const displayLabel = panelSlot?.displayLabel ?? meta.displayLabel;
  const examTitle = title ?? panelSlot?.examTitle ?? displayLabel;
  const { push } = useRouter();
  const { progress, loading, busy, error, start } = useMockSession(meta.id, {
    initialProgress,
  });

  const goToTestPage = (attemptId?: string | null) => {
    const id = attemptId ?? progress?.mock_attempt_id;
    if (id) persistMockAttemptId(meta.id, id);
    push(testHubPath(mockSlug));
  };

  const handlePrimary = async () => {
    if (progress?.status === "completed" && progress.mock_attempt_id) {
      persistMockAttemptId(meta.id, progress.mock_attempt_id);
      push(mockResultsPath(mockSlug, progress.mock_attempt_id));
      return;
    }

    if (progress?.status === "in_progress" && progress.mock_attempt_id) {
      goToTestPage(progress.mock_attempt_id);
      return;
    }

    try {
      const res = await start(false);
      goToTestPage(res.mock_attempt_id);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "";
      if (
        (raw.includes("complete") || raw.includes("retake")) &&
        progress?.mock_attempt_id
      ) {
        push(mockResultsPath(mockSlug, progress.mock_attempt_id));
        return;
      }
      goToTestPage();
    }
  };

  const handleNewAttempt = async () => {
    clearMockExamLocalData(meta.id);
    try {
      const res = await start(true);
      goToTestPage(res.mock_attempt_id);
    } catch {
      goToTestPage();
    }
  };

  const primaryLabel =
    progress?.status === "completed"
      ? "View results"
      : progress?.status === "in_progress"
        ? `Resume ${displayLabel}`
        : `Start ${displayLabel}`;

  const showNewAttempt =
    progress?.status === "in_progress" || progress?.status === "completed";

  return (
    <DashboardCard className="relative overflow-hidden">
      <div className="absolute left-0 top-0 h-1 w-full bg-cyan" />
      <div className="p-5 sm:p-6">
        <span className="inline-flex rounded-md bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {displayLabel}
        </span>
        <h2 className="mt-3 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
          {examTitle}
        </h2>
        {description ? (
          <p className="mt-2 text-[13px] leading-relaxed text-ink/55">
            {description}
          </p>
        ) : (
          <p className="mt-2 text-[13px] leading-relaxed text-ink/55">
            {meta.flowHint}
          </p>
        )}

        {!loading ? (
          <div className="mt-4">
            <ModuleProgressChips modules={progress?.modules} showProgressBar={false} />
          </div>
        ) : (
          <p className="mt-4 text-[12px] text-ink/45">Loading progress…</p>
        )}

        <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-ink/50">
          <ClockIcon className="size-3.5 text-cyan" />
          ~{meta.totalMinutes} min
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePrimary()}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-[14px] font-bold text-white hover:bg-cyan disabled:opacity-60"
          >
            {busy ? "Opening…" : primaryLabel}
            <ArrowRightIcon className="size-4" />
          </button>
          {showNewAttempt ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleNewAttempt()}
              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-ink/10 px-4 py-2.5 text-[13px] font-semibold text-teal hover:border-cyan/30 hover:bg-cyan/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Starting…" : "New attempt"}
            </button>
          ) : null}
          <Link
            href={testHubPath(mockSlug)}
            className="inline-flex min-h-[44px] items-center rounded-xl border border-ink/10 px-4 py-2.5 text-[13px] font-semibold text-ink/60 hover:border-cyan/30 hover:text-teal"
          >
            Open test page
          </Link>
        </div>
        {error ? (
          <p className="mt-2 text-[13px] text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </DashboardCard>
  );
}
