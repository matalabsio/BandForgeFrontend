import { cn } from "@/lib/utils";

export type BandScore = {
  label: string;
  score: number;
  max?: number;
};

type ScoreBandChartProps = {
  bands: BandScore[];
  className?: string;
};

/** Legible at 375px — section 4.4 */
export function ScoreBandChart({ bands, className }: ScoreBandChartProps) {
  return (
    <ul className={cn("space-y-3", className)} aria-label="Band scores">
      {bands.map((band) => {
        const max = band.max ?? 9;
        const pct = Math.min(100, (band.score / max) * 100);
        const passing = band.score >= 6;

        return (
          <li key={band.label}>
            <div className="mb-1 flex items-center justify-between gap-2 text-meta">
              <span className="font-medium text-ink">{band.label}</span>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  passing ? "text-success" : "text-teal",
                )}
              >
                {band.score.toFixed(1)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none",
                  passing ? "bg-success" : "bg-teal",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
