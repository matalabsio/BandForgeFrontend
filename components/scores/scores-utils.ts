import type { DashboardRecentAttempt } from "@/components/bandforge/dashboard/types";
import type { DashboardModule } from "@/components/bandforge/dashboard/types";
import { MODULE_LABELS } from "@/components/bandforge/dashboard/types";
import {
  shortModuleSpeakingPendingPath,
  shortModuleWritingResultsPath,
  testNumberForMockId,
  writingModuleLabel,
} from "@/lib/mock-catalog";
import { listeningModuleResultsPath } from "@/lib/listening-test";
import { readingModuleResultsPath } from "@/lib/reading-test";
import { shortModuleResultsPath } from "@/lib/module-results-path";

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
};

export type SpeakingReviewState = "none" | "under_review" | "scored";

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

function writingPart(attempt: DashboardRecentAttempt): number | null {
  if (attempt.part === 1 || attempt.part === 2) return attempt.part;
  return null;
}

function latestWritingAttemptForPart(
  recent: DashboardRecentAttempt[],
  part: number,
): DashboardRecentAttempt | undefined {
  return recent
    .filter((a) => {
      if (a.module !== "writing" || !isCompletedAttempt(a)) return false;
      const attemptPart = writingPart(a);
      if (attemptPart === part) return true;
      // Legacy rows without part: treat newest unattributed as Task 1 only.
      return part === 1 && attemptPart === null;
    })
    .toSorted(
      (a, b) =>
        new Date(b.completed_at ?? b.started_at).getTime() -
        new Date(a.completed_at ?? a.started_at).getTime(),
    )[0];
}

export function attemptReportHref(
  attempt: DashboardRecentAttempt,
): string | null {
  if (attempt.module === "listening") {
    return listeningModuleResultsPath(attempt.mock_test.id, attempt.id);
  }
  if (attempt.module === "reading") {
    return readingModuleResultsPath(attempt.mock_test.id, attempt.id);
  }
  if (attempt.module === "writing" && isCompletedAttempt(attempt)) {
    const testNumber = testNumberForMockId(attempt.mock_test.id);
    return shortModuleWritingResultsPath(testNumber, attempt.id);
  }
  if (
    attempt.module === "speaking" &&
    attempt.band !== null &&
    isCompletedAttempt(attempt)
  ) {
    const testNumber = testNumberForMockId(attempt.mock_test.id);
    return shortModuleResultsPath(testNumber, "speaking");
  }
  if (attempt.module === "speaking" && isCompletedAttempt(attempt)) {
    return speakingPendingPath(attempt);
  }
  return null;
}

function writingReviewStateForPart(
  recent: DashboardRecentAttempt[],
  part: number,
): SpeakingReviewState {
  const attempt = latestWritingAttemptForPart(recent, part);
  if (!attempt) return "none";
  if (attempt.band != null && attempt.band > 0) return "scored";
  return "under_review";
}

export function speakingReviewState(
  recent: DashboardRecentAttempt[],
): SpeakingReviewState {
  const attempt = latestAttemptForModule(recent, "speaking");
  if (!attempt) return "none";
  if (attempt.band != null && attempt.band > 0) return "scored";
  return "under_review";
}

export function moduleReviewState(
  recent: DashboardRecentAttempt[],
  module: DashboardModule,
): SpeakingReviewState {
  if (module !== "speaking") return "none";
  return speakingReviewState(recent);
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
  if (band != null && band > 0) return band.toFixed(1);
  if (reviewState === "under_review") return "Under review";
  return live ? "—" : "Soon";
}

function normalizeBand(band: number | null | undefined): number | null {
  if (band == null || band <= 0) return null;
  return band;
}

export function latestBandByModule(
  recent: DashboardRecentAttempt[],
): ModuleBand[] {
  const rows: ModuleBand[] = [];

  for (const module of MODULE_ORDER) {
    if (module === "writing") {
      for (const part of [1, 2] as const) {
        const attempt = latestWritingAttemptForPart(recent, part);
        if (!attempt) continue;
        rows.push({
          key: `writing-${part}`,
          module: "writing",
          part,
          label: writingModuleLabel(part),
          band: normalizeBand(attempt.band),
          live: LIVE_MODULES.writing,
          reviewState: writingReviewStateForPart(recent, part),
          attemptId: attempt.id,
          href: attemptReportHref(attempt),
          testNumber: testNumberForMockId(attempt.mock_test.id),
        });
      }
      continue;
    }

    const scored = recent.find(
      (a) =>
        a.module === module &&
        a.band != null &&
        a.band > 0 &&
        isCompletedAttempt(a),
    );
    const latest = latestAttemptForModule(recent, module);
    const reviewState = moduleReviewState(recent, module);
    const band =
      normalizeBand(scored?.band) ??
      (module === "speaking" ? normalizeBand(latest?.band) : null);

    rows.push({
      key: module,
      module,
      label: MODULE_LABELS[module],
      band,
      live: LIVE_MODULES[module],
      reviewState,
      attemptId: latest?.id ?? null,
      href: latest ? attemptReportHref(latest) : null,
      testNumber: latest ? testNumberForMockId(latest.mock_test.id) : null,
    });
  }

  return rows;
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
