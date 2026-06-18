import type { DashboardStats } from "@/components/bandforge/dashboard/types";
import {
  ChartIcon,
  TargetIcon,
  TrendIcon,
  TrophyIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  formatBand,
  resolveProfileTargetBand,
} from "@/components/bandforge/dashboard/utils";
import { cn } from "@/lib/utils";

type Card = {
  label: string;
  value: string;
  hint: string;
  Icon: typeof TargetIcon;
  iconClass?: string;
};

export function ScoresStatRow({
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

  const cards: Card[] = [
    {
      label: "Average band",
      value: formatBand(stats.average_band),
      hint:
        stats.completed_attempts === 0
          ? "Complete a mock"
          : "Across completed mocks",
      Icon: TrendIcon,
      iconClass: "bg-cyan/10 text-cyan",
    },
    {
      label: "Personal best",
      value: formatBand(stats.best_band),
      hint: stats.best_band === null ? "Your peak lands here" : "Keep pushing",
      Icon: TrophyIcon,
      iconClass: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Mocks completed",
      value: String(stats.completed_attempts),
      hint:
        stats.in_progress_attempts > 0
          ? `${stats.in_progress_attempts} in progress`
          : "Total scored attempts",
      Icon: ChartIcon,
      iconClass: "bg-violet-500/10 text-violet-600",
    },
    {
      label: "Target band",
      value: target.toFixed(1),
      hint: "From your profile",
      Icon: TargetIcon,
      iconClass: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  return (
    <section
      aria-label="Performance summary"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((c, i) => (
        <article
          key={c.label}
          className="rounded-2xl border border-ink/8 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold text-ink/45">
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
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-ink sm:text-[26px]">
            {c.value}
          </p>
          <p className="mt-1 text-[11px] text-ink/45">{c.hint}</p>
        </article>
      ))}
    </section>
  );
}
