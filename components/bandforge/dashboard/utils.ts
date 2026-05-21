import type {
  DashboardRecentAttempt,
  DashboardStats,
  DashboardSummary,
} from "@/components/bandforge/dashboard/types";

export function formatBand(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "No activity yet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.round(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "You're up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function targetBand(current: number | null): number {
  if (current === null) return 7.0;
  return Math.min(9, Math.round((current + 0.5) * 2) / 2);
}

export function consistencyScore(stats: DashboardStats): number {
  if (stats.completed_attempts === 0) return 0;
  const base = Math.min(100, stats.completed_attempts * 18);
  if (stats.in_progress_attempts > 0) return Math.min(100, base + 12);
  return base;
}

export function studyStreakDays(summary: DashboardSummary): number {
  const dates = summary.recent
    .map((a) => a.completed_at ?? a.started_at)
    .filter(Boolean)
    .map((iso) => new Date(iso).toDateString());
  const unique = new Set(dates);
  return Math.max(unique.size, summary.in_progress.length > 0 ? 1 : 0);
}

export type WeeklyPoint = { label: string; band: number | null };

export function weeklyBandPoints(recent: DashboardRecentAttempt[]): WeeklyPoint[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const points: WeeklyPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const dayAttempts = recent.filter((a) => {
      const t = new Date(a.completed_at ?? a.started_at);
      return t.toDateString() === key && a.band !== null;
    });
    const avg =
      dayAttempts.length > 0
        ? dayAttempts.reduce((s, a) => s + (a.band ?? 0), 0) / dayAttempts.length
        : null;
    points.push({ label: days[d.getDay()], band: avg });
  }
  return points;
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

export function motivationalLine(stats: DashboardStats): string {
  if (stats.completed_attempts === 0) {
    return "Your Band 7+ journey starts with one focused mock.";
  }
  if (stats.best_band !== null && stats.best_band >= 7.5) {
    return "You're performing at a strong band — refine weak skills to push higher.";
  }
  if (stats.average_band !== null && stats.average_band >= 6.5) {
    return "Steady progress — consistency this week will lift your predicted band.";
  }
  return "Small daily wins compound into a full-band improvement.";
}
