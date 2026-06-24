import type { DashboardRecentAttempt } from "@/components/bandforge/dashboard/types";
import type { DashboardModule } from "@/components/bandforge/dashboard/types";
import { MODULE_LABELS } from "@/components/bandforge/dashboard/types";
import {
  shortModuleSpeakingPendingPath,
  testNumberForMockId,
} from "@/lib/mock-catalog";

export type ModuleBand = {
  module: DashboardModule;
  label: string;
  band: number | null;
  live: boolean;
  reviewState: SpeakingReviewState;
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

function latestAttemptForModule(
  recent: DashboardRecentAttempt[],
  module: DashboardModule,
): DashboardRecentAttempt | undefined {
  return recent
    .filter((a) => a.module === module && (a.completed_at || a.status === "completed"))
    .toSorted(
      (a, b) =>
        new Date(b.completed_at ?? b.started_at).getTime() -
        new Date(a.completed_at ?? a.started_at).getTime(),
    )[0];
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
  return MODULE_ORDER.map((module) => {
    const scored = recent.find(
      (a) =>
        a.module === module &&
        a.band != null &&
        a.band > 0 &&
        (a.completed_at || a.status === "completed"),
    );
    const reviewState = moduleReviewState(recent, module);
    return {
      module,
      label: MODULE_LABELS[module],
      band: normalizeBand(scored?.band),
      live: LIVE_MODULES[module],
      reviewState,
    };
  });
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
