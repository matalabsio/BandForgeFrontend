export type CriteriaVsTargetRow = {
  key: string;
  shortLabel: string;
  label: string;
  band: number | null;
  targetGap: number | null;
};

function bandToPercent(band: number): number {
  return Math.min(100, Math.max(0, (band / 9) * 100));
}

function deltaLabel(delta: number | null): string {
  if (delta == null) return "";
  if (delta <= 0) return "on target";
  return `(−${delta.toFixed(1)})`;
}

type Props = {
  criteria: CriteriaVsTargetRow[];
  targetBand: number | null;
  className?: string;
};

export function CriteriaVsTargetBars({ criteria, targetBand, className = "" }: Props) {
  const targetLeft = targetBand == null ? null : bandToPercent(targetBand);

  return (
    <div
      className={`rounded-2xl border border-border-soft bg-white p-4 shadow-soft sm:p-5 ${className}`.trim()}
    >
      <div className={targetLeft != null ? "relative pt-6" : "relative"}>
        {targetLeft != null ? (
          <>
            <div
              className="pointer-events-none absolute top-6 bottom-0 w-0 -translate-x-1/2 border-l-2 border-dashed border-[#E8983A]"
              style={{ left: `${targetLeft}%` }}
              aria-hidden="true"
            />
            <span
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-medium text-[#B26A00]"
              style={{ left: `${targetLeft}%` }}
            >
              target {targetBand!.toFixed(1)}
            </span>
          </>
        ) : null}

        <div className="flex flex-col gap-4">
          {criteria.map((criterion) => {
            const onTarget = criterion.targetGap != null && criterion.targetGap <= 0;
            const barWidth =
              criterion.band == null ? 0 : bandToPercent(criterion.band);
            return (
              <div key={criterion.key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-4">
                  <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-navy">
                    {criterion.shortLabel}{" "}
                    <span className="text-[11.5px] font-normal text-muted-light">
                      {criterion.label}
                    </span>
                  </p>
                  <p className="shrink-0 text-right font-mono text-[12.5px] leading-none tabular-nums">
                    <strong className="font-medium text-navy">
                      {criterion.band == null ? "—" : criterion.band.toFixed(1)}
                    </strong>
                    {criterion.band != null ? (
                      <span
                        className={
                          criterion.targetGap != null && criterion.targetGap > 0
                            ? "ml-1.5 text-[#D98309]"
                            : "ml-1.5 text-success"
                        }
                      >
                        {deltaLabel(criterion.targetGap)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div
                  className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-slate-200 to-slate-300"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={9}
                  aria-valuenow={criterion.band ?? undefined}
                  aria-label={`${criterion.label}${
                    criterion.band == null
                      ? ", score unavailable"
                      : `, Band ${criterion.band.toFixed(1)}`
                  }${targetBand == null ? "" : `, target Band ${targetBand.toFixed(1)}`}`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      onTarget ? "bg-emerald-500" : "bg-gradient-to-r from-teal to-cyan"
                    }`}
                    style={{ width: `${barWidth}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {targetBand == null ? (
        <p className="mt-4 text-[11px] text-muted">No target band was set for this report.</p>
      ) : null}
    </div>
  );
}
