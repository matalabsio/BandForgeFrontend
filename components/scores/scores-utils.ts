import type { DashboardRecentAttempt } from "@/components/bandforge/dashboard/types";
import type { DashboardModule } from "@/components/bandforge/dashboard/types";
import { MODULE_LABELS } from "@/components/bandforge/dashboard/types";

export type ModuleBand = {
  module: DashboardModule;
  label: string;
  band: number | null;
  live: boolean;
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
  writing: false,
  speaking: false,
};

export function latestBandByModule(
  recent: DashboardRecentAttempt[],
): ModuleBand[] {
  return MODULE_ORDER.map((module) => {
    const attempt = recent.find(
      (a) => a.module === module && a.band !== null,
    );
    return {
      module,
      label: MODULE_LABELS[module],
      band: attempt?.band ?? null,
      live: LIVE_MODULES[module],
    };
  });
}

export function strongestModule(bands: ModuleBand[]): ModuleBand | null {
  const withBand = bands.filter((b) => b.band !== null);
  if (withBand.length === 0) return null;
  return withBand.reduce((best, cur) =>
    (cur.band ?? 0) > (best.band ?? 0) ? cur : best,
  );
}

export function focusModule(bands: ModuleBand[]): ModuleBand | null {
  const withBand = bands.filter((b) => b.band !== null && b.live);
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
