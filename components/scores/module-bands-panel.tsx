import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  DashboardCard,
  DashboardCardHeader,
} from "@/components/bandforge/dashboard/dashboard-card";
import type { ModuleBand } from "@/components/scores/scores-utils";
import { bandBarColor } from "@/components/scores/scores-utils";
import { cn } from "@/lib/utils";

const ICONS = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
} as const;

export function ModuleBandsPanel({ bands }: { bands: ModuleBand[] }) {
  return (
    <DashboardCard className="flex h-full flex-col">
      <DashboardCardHeader
        title="Band by module"
        subtitle="Latest band per skill (live modules only)"
      />
      <ul className="space-y-4 p-5 pt-2">
        {bands.map((row) => {
          const Icon = ICONS[row.module];
          const pct =
            row.band !== null ? Math.min(100, (row.band / 9) * 100) : 0;
          return (
            <li key={row.module}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      row.live
                        ? "bg-cyan/10 text-cyan"
                        : "bg-ink/5 text-ink/35",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[13px] font-semibold text-ink">
                    {row.label}
                  </span>
                </div>
                <span className="shrink-0 text-[13px] font-bold tabular-nums text-ink">
                  {row.band !== null ? row.band.toFixed(1) : row.live ? "—" : "Soon"}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/8">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    bandBarColor(row.band),
                  )}
                  style={{ width: row.band !== null ? `${pct}%` : "0%" }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
