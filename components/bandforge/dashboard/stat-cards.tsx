import type { DashboardStats } from "@/components/bandforge/dashboard/types";
import {
  ChartIcon,
  ClockIcon,
  FlameIcon,
  TrophyIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  consistencyScore,
  formatBand,
  formatRelative,
} from "@/components/bandforge/dashboard/utils";

type Stat = {
  label: string;
  value: string;
  sub: string;
  Icon: typeof ChartIcon;
};

export function StatCards({ stats }: { stats: DashboardStats }) {
  const cards: Stat[] = [
    {
      label: "Mocks completed",
      value: String(stats.completed_attempts),
      sub:
        stats.in_progress_attempts > 0
          ? `${stats.in_progress_attempts} in progress`
          : "Full pipeline ready",
      Icon: ChartIcon,
    },
    {
      label: "Average band",
      value: formatBand(stats.average_band),
      sub:
        stats.average_band === null
          ? "Finish a mock to unlock"
          : "Across completed mocks",
      Icon: FlameIcon,
    },
    {
      label: "Personal best",
      value: formatBand(stats.best_band),
      sub: stats.best_band === null ? "Your peak lands here" : "Keep pushing",
      Icon: TrophyIcon,
    },
    {
      label: "Consistency",
      value: `${consistencyScore(stats)}%`,
      sub: formatRelative(stats.last_activity_at),
      Icon: ClockIcon,
    },
  ];

  return (
    <section
      aria-label="Performance metrics"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((c, i) => (
        <article
          key={c.label}
          className="bf-dash-enter group rounded-[18px] border border-white/80 bg-white/65 p-4 shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all duration-200 hover:border-[#06B6D4]/25 hover:shadow-[0_12px_36px_rgba(6,182,212,0.12)]"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F172A]/40">
              {c.label}
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] transition-transform duration-200 group-hover:scale-105">
              <c.Icon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-[#0F172A]">
            {c.value}
          </p>
          <p className="mt-1 text-[11px] text-[#0F172A]/50">{c.sub}</p>
        </article>
      ))}
    </section>
  );
}
