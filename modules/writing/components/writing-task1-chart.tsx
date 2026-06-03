"use client";

type ChartSeries = { mode: string; values: number[] };

export type WritingChartSpec = {
  type?: string;
  title?: string;
  source?: string;
  y_max?: number;
  cities: string[];
  series: ChartSeries[];
};

/** Examiner pack: Car dark blue, Public Transport teal, Cycling amber, Walking light grey */
const SERIES_FILL = ["#1e3a5f", "#0d9488", "#f59e0b", "#d1d5db"];

const Y_TICKS = [0, 10, 20, 30, 40, 50, 60, 70];

type Props = {
  chart: WritingChartSpec;
  figureLabel?: string;
  figureNote?: string;
};

/**
 * IELTS-style grouped bar chart (SVG) — four modes per city, y-axis 0–70%.
 */
export function WritingTask1Chart({
  chart,
  figureLabel = "Figure 1",
  figureNote,
}: Props) {
  const yMax = chart.y_max ?? 70;
  const ticks = Y_TICKS.filter((t) => t <= yMax);

  const width = 520;
  const height = 268;
  const margin = { top: 12, right: 12, bottom: 52, left: 40 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const groupCount = chart.cities.length;
  const seriesCount = chart.series.length;
  const groupSlot = plotW / groupCount;
  const groupInnerW = groupSlot * 0.82;
  const barGap = 2;
  const barW =
    seriesCount > 0
      ? (groupInnerW - barGap * (seriesCount - 1)) / seriesCount
      : 0;

  const yPos = (value: number) =>
    margin.top + plotH - (value / yMax) * plotH;

  return (
    <figure className="mt-4 w-full max-w-xl rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <figcaption className="min-w-0 flex-1 text-[12px] font-semibold leading-snug text-navy">
          <span className="font-bold">{figureLabel}:</span>{" "}
          {chart.title ??
            "Percentage of commuters using different modes of transport in four cities, 2022"}
        </figcaption>
        <ul
          className="flex shrink-0 flex-col gap-1 text-[10px] leading-tight text-ink/70 sm:items-end"
          aria-label="Chart legend"
        >
          {chart.series.map((s, i) => (
            <li key={s.mode} className="flex items-center gap-1.5">
              <span
                className="inline-block size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: SERIES_FILL[i % SERIES_FILL.length] }}
                aria-hidden
              />
              <span>{s.mode}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto h-auto w-full min-w-[320px] max-w-[520px]"
          role="img"
          aria-label={chart.title ?? "Grouped bar chart of commuter transport modes"}
        >
          {/* Horizontal grid + y-axis labels */}
          {ticks.map((tick) => {
            const y = yPos(tick);
            return (
              <g key={tick}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotW}
                  y2={y}
                  stroke={tick === 0 ? "#94a3b8" : "#e2e8f0"}
                  strokeWidth={tick === 0 ? 1.25 : 1}
                />
                <text
                  x={margin.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[9px]"
                  fontSize={9}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Y-axis title */}
          <text
            x={12}
            y={margin.top + plotH / 2}
            textAnchor="middle"
            transform={`rotate(-90, 12, ${margin.top + plotH / 2})`}
            className="fill-slate-500 text-[9px]"
            fontSize={9}
          >
            Percentage (%)
          </text>

          {/* Grouped bars */}
          {chart.cities.map((city, cityIdx) => {
            const groupX =
              margin.left + cityIdx * groupSlot + (groupSlot - groupInnerW) / 2;

            return (
              <g key={city}>
                {chart.series.map((s, sIdx) => {
                  const v = s.values[cityIdx] ?? 0;
                  const x = groupX + sIdx * (barW + barGap);
                  const barTop = yPos(v);
                  const barBottom = yPos(0);
                  const barHeight = barBottom - barTop;

                  return (
                    <rect
                      key={s.mode}
                      x={x}
                      y={barTop}
                      width={Math.max(barW, 1)}
                      height={Math.max(barHeight, 0)}
                      fill={SERIES_FILL[sIdx % SERIES_FILL.length]}
                      rx={1}
                    >
                      <title>{`${city} — ${s.mode}: ${v}%`}</title>
                    </rect>
                  );
                })}
                <text
                  x={groupX + groupInnerW / 2}
                  y={height - margin.bottom + 16}
                  textAnchor="middle"
                  className="fill-slate-700 text-[10px] font-medium"
                  fontSize={10}
                >
                  {city}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {chart.source ? (
        <p className="mt-2 text-center text-[10px] text-ink/50">
          (Source: {chart.source})
        </p>
      ) : null}
      {figureNote ? (
        <p className="mt-1 text-center text-[10px] italic text-ink/40">{figureNote}</p>
      ) : null}
    </figure>
  );
}
