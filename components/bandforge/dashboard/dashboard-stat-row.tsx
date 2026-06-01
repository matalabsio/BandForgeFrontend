import type { DashboardStats } from "@/components/bandforge/dashboard/types";
import {
  ChartIcon,
  ClockIcon,
  FlameIcon,
  TargetIcon,
  TrendIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  formatBand,
  resolveProfileTargetBand,
} from "@/components/bandforge/dashboard/utils";
import { cn } from "@/lib/utils";

function estimatePracticeMinutes(stats: DashboardStats): number {
  return stats.completed_attempts * 28 + stats.in_progress_attempts * 12;
}

function formatPracticeTime(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

type Card = {
  label: string;
  value: string;
  hint: string;
  Icon: typeof TargetIcon;
  iconClass?: string;
};

export function DashboardStatRow({
  stats,
  profileTargetBand,
}: {
  stats: DashboardStats;
  profileTargetBand?: number | null;
}) {
  const target = resolveProfileTargetBand(
    profileTargetBand,
    stats.average_band,
  );
  const predicted = stats.average_band;
  const streak = stats.current_streak ?? 0;
  const practiceMin = estimatePracticeMinutes(stats);

  const cards: Card[] = [
    {
      label: "Target Band",
      value: target.toFixed(1),
      hint: "Keep aiming high!",
      Icon: TargetIcon,
      iconClass: "bg-[#06B6D4]/10 text-[#06B6D4]",
    },
    {
      label: "Estimated Band",
      value: formatBand(predicted),
      hint: predicted === null ? "Finish a mock" : "Keep practicing",
      Icon: TrendIcon,
      iconClass: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Practice Time",
      value: formatPracticeTime(practiceMin),
      hint: "This week (est.)",
      Icon: ClockIcon,
      iconClass: "bg-violet-500/10 text-violet-600",
    },
    {
      label: "Streak",
      value: streak > 0 ? `${streak} days` : "—",
      hint: streak > 0 ? "You're on fire!" : "Start today",
      Icon: FlameIcon,
      iconClass: "bg-orange-500/10 text-orange-500",
    },
  ];

  return (
    <section
      aria-label="Key metrics"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((c, i) => (
        <article
          key={c.label}
          className="rounded-2xl border border-[#0F172A]/8 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold text-[#0F172A]/45">
              {c.label}
            </p>
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                c.iconClass,
              )}
            >
              <c.Icon className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#0F172A] sm:text-[26px]">
            {c.value}
          </p>
          <p className="mt-1 text-[11px] text-[#0F172A]/45">{c.hint}</p>
          {c.label === "Estimated Band" && predicted !== null ? (
            <div className="mt-3 flex h-6 items-end gap-0.5 opacity-60">
              {[3, 5, 4, 6, 7].map((h, j) => (
                <span
                  key={j}
                  className="w-1.5 rounded-sm bg-[#06B6D4]"
                  style={{ height: `${h * 3}px` }}
                />
              ))}
            </div>
          ) : c.label === "Target Band" ? (
            <ChartIcon className="mt-2 size-4 text-[#0F172A]/15" aria-hidden />
          ) : null}
        </article>
      ))}
    </section>
  );
}
