import type {
  DashboardRecentAttempt,
  DashboardStats,
  DashboardSummary,
} from "@/components/bandforge/dashboard/types";
import { appTimeHour, formatDateShort } from "@/lib/date-format";

export function formatBand(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function timeGreeting(): string {
  const hour = appTimeHour();
  if (hour < 5) return "You're up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Suggested target from mock performance when profile has no explicit goal. */
function suggestedTargetBand(averageBand: number | null): number {
  if (averageBand === null) return 7.0;
  return Math.min(9, Math.round((averageBand + 0.5) * 2) / 2);
}

/** Profile `target_band` wins; otherwise derive from average band. */
export function resolveProfileTargetBand(
  profileTarget: number | null | undefined,
  averageBand: number | null,
): number {
  if (
    profileTarget !== null &&
    profileTarget !== undefined &&
    !Number.isNaN(profileTarget)
  ) {
    return profileTarget;
  }
  return suggestedTargetBand(averageBand);
}

export function deriveInsights(summary: DashboardSummary): string[] {
  const lines: string[] = [];
  const { stats, recent } = summary;

  if (stats.completed_attempts === 0) {
    lines.push("Complete your first listening mock to unlock AI performance insights.");
    return lines;
  }

  if (stats.average_band !== null && stats.average_band < 6) {
    lines.push("Matching and note-completion questions often cost 15–20% of listening marks.");
  } else if (stats.average_band !== null && stats.average_band >= 7) {
    lines.push("You're tracking toward Band 7+ — keep one mock per week for consistency.");
  }

  const listening = recent.filter((a) => a.module === "listening" && a.band !== null);
  if (listening.length >= 2) {
    const latest = listening[0].band ?? 0;
    const prev = listening[1].band ?? 0;
    const delta = Math.round((latest - prev) * 10);
    if (delta > 0) {
      lines.push(`Your listening band improved ${delta}% on your latest attempt.`);
    }
  }

  if (stats.in_progress_attempts > 0) {
    lines.push("You have an in-progress mock — resume to protect your study momentum.");
  }

  if (lines.length < 2) {
    lines.push("Aim for 3 focused sessions this week to stabilise your predicted band.");
  }

  return lines.slice(0, 3);
}

