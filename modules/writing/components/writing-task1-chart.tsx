"use client";

import type { WritingChartSpec } from "@/modules/writing/types";

export type { WritingChartSpec };

function seriesLabel(s: WritingChartSpec["series"][number]): string {
  return s.mode ?? s.label ?? "Series";
}

/** Examiner pack: Car dark blue, Public Transport teal, Cycling amber, Walking light grey */
const SERIES_FILL = ["#1e3a5f", "#0d9488", "#f59e0b", "#d1d5db"];

const BAR_Y_TICKS = [0, 10, 20, 30, 40, 50, 60, 70];
const LINE_COLORS = ["#0d9488", "#1e3a5f", "#f59e0b", "#dc2626", "#7c3aed", "#64748b"];

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
  const cities = chart.cities ?? [];
  const yMax = chart.y_max ?? 70;
  const ticks = BAR_Y_TICKS.filter((t) => t <= yMax);

  const width = 520;
  const height = 268;
  const margin = { top: 12, right: 12, bottom: 52, left: 40 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const groupCount = cities.length;
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
            <li key={seriesLabel(s)} className="flex items-center gap-1.5">
              <span
                className="inline-block size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: SERIES_FILL[i % SERIES_FILL.length] }}
                aria-hidden
              />
              <span>{seriesLabel(s)}</span>
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
          {cities.map((city, cityIdx) => {
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
                      key={seriesLabel(s)}
                      x={x}
                      y={barTop}
                      width={Math.max(barW, 1)}
                      height={Math.max(barHeight, 0)}
                      fill={SERIES_FILL[sIdx % SERIES_FILL.length]}
                      rx={1}
                    >
                      <title>{`${city} — ${seriesLabel(s)}: ${v}%`}</title>
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

/**
 * IELTS-style multi-line graph (SVG) — years on x-axis, billions on y-axis.
 */
export function WritingTask1LineChart({
  chart,
  figureLabel = "Figure 1",
  figureNote,
}: Props) {
  const labels = chart.labels ?? [];
  const yMax = chart.y_max ?? 3;
  const yUnit = chart.y_unit ?? "billions";
  const tickStep = yMax <= 1 ? 0.2 : yMax <= 3 ? 0.5 : 1;
  const ticks: number[] = [];
  for (let t = 0; t <= yMax + 0.001; t += tickStep) {
    ticks.push(Math.round(t * 100) / 100);
  }

  const width = 560;
  const height = 300;
  const margin = { top: 16, right: 16, bottom: 52, left: 44 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const pointCount = labels.length;

  const xPos = (idx: number) =>
    margin.left + (pointCount <= 1 ? plotW / 2 : (idx / (pointCount - 1)) * plotW);
  const yPos = (value: number) =>
    margin.top + plotH - (value / yMax) * plotH;

  return (
    <figure className="mt-4 w-full max-w-xl rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <figcaption className="min-w-0 flex-1 text-[12px] font-semibold leading-snug text-navy">
          <span className="font-bold">{figureLabel}:</span>{" "}
          {chart.title ?? "Line graph"}
        </figcaption>
        <ul
          className="flex shrink-0 flex-col gap-1 text-[10px] leading-tight text-ink/70 sm:items-end"
          aria-label="Chart legend"
        >
          {chart.series.map((s, i) => (
            <li key={seriesLabel(s)} className="flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: LINE_COLORS[i % LINE_COLORS.length] }}
                aria-hidden
              />
              <span>{seriesLabel(s)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto h-auto w-full min-w-[320px] max-w-[560px]"
          role="img"
          aria-label={chart.title ?? "Line graph"}
        >
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

          <text
            x={12}
            y={margin.top + plotH / 2}
            textAnchor="middle"
            transform={`rotate(-90, 12, ${margin.top + plotH / 2})`}
            className="fill-slate-500 text-[9px]"
            fontSize={9}
          >
            Internet users ({yUnit})
          </text>

          {chart.series.map((s, sIdx) => {
            const color = LINE_COLORS[sIdx % LINE_COLORS.length];
            const points = s.values
              .map((v, i) => `${xPos(i)},${yPos(v)}`)
              .join(" ");
            return (
              <g key={seriesLabel(s)}>
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={points}
                />
                {s.values.map((v, i) => (
                  <circle
                    key={`${seriesLabel(s)}-${labels[i] ?? i}`}
                    cx={xPos(i)}
                    cy={yPos(v)}
                    r={3}
                    fill={color}
                  >
                    <title>{`${labels[i] ?? i} — ${seriesLabel(s)}: ${v}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}

          {labels.map((label, i) => (
            <text
              key={label}
              x={xPos(i)}
              y={height - margin.bottom + 16}
              textAnchor="middle"
              className="fill-slate-700 text-[10px] font-medium"
              fontSize={10}
            >
              {label}
            </text>
          ))}
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
