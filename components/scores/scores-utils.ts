import type {
  DashboardMockSnapshot,
  DashboardRecentAttempt,
} from "@/components/bandforge/dashboard/types";
import type { DashboardModule } from "@/components/bandforge/dashboard/types";
import { MODULE_LABELS } from "@/components/bandforge/dashboard/types";
import {
  shortModuleSpeakingPendingPath,
  shortModuleWritingResultsPath,
  testNumberForMockId,
} from "@/lib/mock-catalog";
import { listeningModuleResultsPath } from "@/lib/listening-test";
import { readingModuleResultsPath } from "@/lib/reading-test";
import { shortSectionResultsPath } from "@/lib/section-results-path";

export type SpeakingReviewState = "none" | "under_review" | "scored";

export type ModuleBand = {
  key: string;
  module: DashboardModule;
  label: string;
  band: number | null;
  live: boolean;
  reviewState: SpeakingReviewState;
  part?: number;
  attemptId?: string | null;
  href?: string | null;
  testNumber?: number | null;
  mockAttemptId?: string | null;
};

const MODULE_ORDER: DashboardModule[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

const LIVE_MODULES: Record<DashboardModule, boolean> = {
  listening: true,
  reading: true,
  writing: true,
  speaking: true,
};

function isCompletedAttempt(attempt: DashboardRecentAttempt): boolean {
  return Boolean(attempt.completed_at || attempt.status === "completed");
}

function normalizeBand(band: number | null | undefined): number | null {
  if (band == null || band <= 0) return null;
  return band;
}

function latestAttemptForModule(
  recent: DashboardRecentAttempt[],
  module: DashboardModule,
): DashboardRecentAttempt | undefined {
  return recent
    .filter((a) => a.module === module && isCompletedAttempt(a))
    .toSorted(
      (a, b) =>
        new Date(b.completed_at ?? b.started_at).getTime() -
        new Date(a.completed_at ?? a.started_at).getTime(),
    )[0];
}

function rollupBandForModule(
  latestMock: DashboardMockSnapshot | null | undefined,
  module: DashboardModule,
): number | null {
  if (!latestMock) return null;
  const map: Record<DashboardModule, keyof DashboardMockSnapshot> = {
    listening: "listening_band",
    reading: "reading_band",
    writing: "writing_band",
    speaking: "speaking_band",
  };
  const raw = latestMock[map[module]];
  return normalizeBand(typeof raw === "number" ? raw : null);
}

export function attemptReportHref(
  attempt: DashboardRecentAttempt,
): string | null {
  const testNumber = testNumberForMockId(attempt.mock_test.id);
  const mockAttemptId = attempt.mock_attempt_id?.trim() || null;
  const part = attempt.part ?? undefined;

  if (
    mockAttemptId &&
    (attempt.module === "listening" || attempt.module === "reading")
  ) {
    return shortSectionResultsPath(testNumber, attempt.module, {
      attempt: attempt.id,
      part,
      mockAttempt: mockAttemptId,
    });
  }

  if (mockAttemptId && attempt.module === "writing" && isCompletedAttempt(attempt)) {
    return shortSectionResultsPath(testNumber, "writing", {
      attempt: attempt.id,
      part,
      mockAttempt: mockAttemptId,
    });
  }

  if (mockAttemptId && attempt.module === "speaking" && isCompletedAttempt(attempt)) {
    return shortSectionResultsPath(testNumber, "speaking", {
      attempt: attempt.id,
      mockAttempt: mockAttemptId,
    });
  }

  if (attempt.module === "listening") {
    return listeningModuleResultsPath(attempt.mock_test.id, attempt.id);
  }
  if (attempt.module === "reading") {
    return readingModuleResultsPath(attempt.mock_test.id, attempt.id);
  }
  if (attempt.module === "writing" && isCompletedAttempt(attempt)) {
    return shortModuleWritingResultsPath(testNumber, attempt.id);
  }
  if (attempt.module === "speaking" && isCompletedAttempt(attempt)) {
    return shortSectionResultsPath(testNumber, "speaking", {
      attempt: attempt.id,
    });
  }
  return null;
}

export function speakingReviewState(
  recent: DashboardRecentAttempt[],
): SpeakingReviewState {
  const attempt = latestAttemptForModule(recent, "speaking");
  if (!attempt) return "none";
  if (
    attempt.band != null &&
    attempt.band > 0 &&
    attempt.score_source !== "ai_estimate"
  ) {
    return "scored";
  }
  return "under_review";
}

function writingReviewState(recent: DashboardRecentAttempt[]): SpeakingReviewState {
  const attempt = latestAttemptForModule(recent, "writing");
  if (!attempt) return "none";
  if (
    attempt.band != null &&
    attempt.band > 0 &&
    attempt.score_source !== "ai_estimate"
  ) {
    return "scored";
  }
  return "under_review";
}

export function moduleReviewState(
  recent: DashboardRecentAttempt[],
  module: DashboardModule,
): SpeakingReviewState {
  if (module === "speaking") return speakingReviewState(recent);
  if (module === "writing") return writingReviewState(recent);
  return "none";
}

export function speakingPendingPath(attempt: DashboardRecentAttempt): string {
  const testNumber = testNumberForMockId(attempt.mock_test.id);
  return shortModuleSpeakingPendingPath(testNumber, attempt.id);
}

export function moduleBandLabel(
  band: number | null,
  reviewState: SpeakingReviewState,
  live: boolean,
): string {
  if (band != null && band > 0) {
    return reviewState === "under_review"
      ? `AI ${band.toFixed(1)}`
      : band.toFixed(1);
  }
  if (reviewState === "under_review") return "Under review";
  return live ? "—" : "Soon";
}

export function dashboardModuleBands(
  recent: DashboardRecentAttempt[],
  latestMock?: DashboardMockSnapshot | null,
): ModuleBand[] {
  return MODULE_ORDER.map((module) => {
    const latest = latestAttemptForModule(recent, module);
    const reviewState = moduleReviewState(recent, module);
    const rollup = rollupBandForModule(latestMock, module);
    let band = rollup;
    if (band == null) {
      band = normalizeBand(latest?.band);
    }
    const testNumber = latest
      ? testNumberForMockId(latest.mock_test.id)
      : latestMock?.catalog_number ?? null;

    return {
      key: module,
      module,
      label: MODULE_LABELS[module],
      band,
      live: LIVE_MODULES[module],
      reviewState,
      attemptId: latest?.id ?? null,
      href: latest ? attemptReportHref(latest) : null,
      testNumber: typeof testNumber === "number" ? testNumber : null,
      mockAttemptId: latest?.mock_attempt_id ?? latestMock?.mock_attempt_id ?? null,
    };
  });
}

/** @deprecated Prefer dashboardModuleBands with latest_mock snapshot. */
export function latestBandByModule(
  recent: DashboardRecentAttempt[],
): ModuleBand[] {
  return dashboardModuleBands(recent, null);
}

export function countCompletedForModule(
  recent: DashboardRecentAttempt[],
  module: DashboardModule,
  part?: number,
): number {
  return recent.filter(
    (a) =>
      a.module === module &&
      (part == null || a.part === part) &&
      (a.completed_at || a.status === "completed"),
  ).length;
}

export function countTestedModuleBands(
  bands: ModuleBand[],
  recent: DashboardRecentAttempt[],
): number {
  return bands.filter(
    (b) =>
      (b.band != null && b.band > 0) ||
      b.reviewState !== "none" ||
      countCompletedForModule(recent, b.module, b.part) > 0,
  ).length;
}

export function dashboardOverallBand(
  summary: {
    stats: { average_band: number | null };
    completed_mock_count?: number;
    latest_mock?: DashboardMockSnapshot | null;
  },
): number | null {
  const latest = summary.latest_mock;
  if (latest?.status === "completed" && latest.aggregate_band != null) {
    return latest.aggregate_band;
  }
  if ((summary.completed_mock_count ?? 0) > 0 && summary.stats.average_band != null) {
    return summary.stats.average_band;
  }
  if (latest?.aggregate_band != null && latest.aggregate_band > 0) {
    return latest.aggregate_band;
  }
  return null;
}

export function strongestModule(bands: ModuleBand[]): ModuleBand | null {
  const withBand = bands.filter((b) => b.band != null && b.band > 0);
  if (withBand.length === 0) return null;
  return withBand.reduce((best, cur) =>
    (cur.band ?? 0) > (best.band ?? 0) ? cur : best,
  );
}

export function focusModule(bands: ModuleBand[]): ModuleBand | null {
  const withBand = bands.filter((b) => b.band != null && b.band > 0 && b.live);
  if (withBand.length === 0) return null;
  return withBand.reduce((low, cur) =>
    (cur.band ?? 9) < (low.band ?? 9) ? cur : low,
  );
}

export function bandBarColor(band: number | null): string {
  if (band === null) return "bg-ink/10";
  if (band >= 7.5) return "bg-emerald-500";
  if (band >= 6) return "bg-cyan";
  if (band >= 5) return "bg-amber-500";
  return "bg-red-500";
}

export function bandBadgeClass(band: number | null): string {
  if (band === null) return "bg-ink/5 text-ink/50";
  if (band >= 7.5) return "bg-emerald-500/12 text-emerald-700";
  if (band >= 6) return "bg-cyan/12 text-teal";
  if (band >= 5) return "bg-amber-500/12 text-amber-700";
  return "bg-red-500/10 text-red-600";
}

export function underReviewBadgeClass(): string {
  return "bg-amber-500/12 text-amber-800";
}

export function isWritingUnderReview(attempt: DashboardRecentAttempt): boolean {
  return (
    attempt.module === "writing" &&
    attempt.band === null &&
    isCompletedAttempt(attempt)
  );
}

export function isSpeakingUnderReview(attempt: DashboardRecentAttempt): boolean {
  return (
    attempt.module === "speaking" &&
    attempt.band === null &&
    isCompletedAttempt(attempt)
  );
}
