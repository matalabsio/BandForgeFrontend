"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import type {
  DashboardModule,
  DashboardRecentAttempt,
} from "@/components/bandforge/dashboard/types";
import { MODULE_LABELS } from "@/components/bandforge/dashboard/types";
import {
  ArrowRightIcon,
  ChartIcon,
} from "@/components/bandforge/dashboard/icons";
import { BfEmptyState } from "@/components/bandforge/ui";
import { formatBand } from "@/components/bandforge/dashboard/utils";
import { formatDateShort } from "@/lib/date-format";
import { FORGE_NAVY, FORGE_TEAL, SIGNAL_CYAN } from "@/lib/brand";
import { cn } from "@/lib/utils";

const CHART_W = 340;
const CHART_H = 140;
const PAD_X = 32;
const PAD_Y = 16;
const MIN_BAND = 0;
const MAX_BAND = 9;
const TARGET_BAND = 6;

const MODULE_CHART_COLORS: Record<DashboardModule, string> = {
  listening: SIGNAL_CYAN,
  reading: "#A78BFA",
  writing: "#FBBF24",
  speaking: "#34D399",
};

const MODULE_SHORT: Record<DashboardModule, string> = {
  listening: "L",
  reading: "R",
  writing: "W",
  speaking: "S",
};

type Point = {
  x: number;
  y: number;
  band: number;
  label: string;
  title: string;
  module: DashboardModule;
  color: string;
};

type ModuleFilter =
  | "all"
  | "listening"
  | "reading"
  | "writing"
  | "speaking";

function pointLabel(
  attempt: DashboardRecentAttempt,
  showModule: boolean,
): string {
  const date = formatDateShort(attempt.completed_at ?? attempt.started_at);
  if (!showModule) return date;
  const mod = attempt.module as DashboardModule;
  const short = MODULE_SHORT[mod] ?? mod.slice(0, 1).toUpperCase();
  return `${short} · ${date}`;
}

function buildPoints(
  attempts: DashboardRecentAttempt[],
  showModule: boolean,
): Point[] {
  const withBand = attempts
    .filter(
      (a) =>
        a.band !== null && (a.completed_at || a.status === "completed"),
    )
    .slice()
    .reverse()
    .slice(-8);

  if (withBand.length === 0) return [];

  const n = withBand.length;
  const innerW = CHART_W - PAD_X * 2;
  const innerH = CHART_H - PAD_Y * 2;

  return withBand.map((a, i) => {
    const band = a.band ?? 0;
    const mod = a.module as DashboardModule;
    const x = PAD_X + (i / Math.max(1, n - 1)) * innerW;
    const y =
      CHART_H - PAD_Y - ((band - MIN_BAND) / (MAX_BAND - MIN_BAND)) * innerH;
    return {
      x,
      y,
      band,
      label: pointLabel(a, showModule),
      title: a.mock_test.title,
      module: mod,
      color: MODULE_CHART_COLORS[mod] ?? SIGNAL_CYAN,
    };
  });
}

function modulesWithData(attempts: DashboardRecentAttempt[]): ModuleFilter[] {
  const mods = new Set(attempts.map((a) => a.module));
  const filters: ModuleFilter[] = ["all"];
  for (const key of [
    "listening",
    "reading",
    "writing",
    "speaking",
  ] as const) {
    if (mods.has(key)) filters.push(key);
  }
  return filters;
}

function filterAttempts(
  attempts: DashboardRecentAttempt[],
  module: ModuleFilter,
): DashboardRecentAttempt[] {
  if (module === "all") return attempts;
  return attempts.filter((a) => a.module === module);
}

function smoothLinePath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x - 28},${p.y} L ${p.x + 28},${p.y}`;
  }
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const cx = (prev.x + cur.x) / 2;
    d += ` C ${cx},${prev.y} ${cx},${cur.y} ${cur.x},${cur.y}`;
  }
  return d;
}

function ModulePills({
  value,
  onChange,
  options,
}: {
  value: ModuleFilter;
  onChange: (v: ModuleFilter) => void;
  options: ModuleFilter[];
}) {
  return (
    <div
      className="flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-ink/8 bg-ink/[0.03] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filter by module"
    >
      {options.map((key) => {
        const label =
          key === "all"
            ? "All"
            : (MODULE_LABELS[key as keyof typeof MODULE_LABELS] ?? key);
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200",
              active
                ? "bg-gradient-to-r from-cyan to-teal text-white shadow-[0_2px_10px_rgba(0,151,167,0.35)]"
                : "text-ink/50 hover:bg-white/80 hover:text-ink/80",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-bold text-ink/40">
        —
      </span>
    );
  }
  const positive = delta >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums",
        positive
          ? "bg-emerald-500/15 text-emerald-700"
          : "bg-red-500/10 text-red-600",
      )}
    >
      {positive ? "↑" : "↓"} {positive ? "+" : ""}
      {delta.toFixed(1)}
    </span>
  );
}

export function PerformanceChart({
  attempts,
  averageBand,
}: {
  attempts: DashboardRecentAttempt[];
  averageBand: number | null;
}) {
  const gradientId = useId().replace(/:/g, "");
  const glowId = `glow-${gradientId}`;
  const filterOptions = useMemo(() => modulesWithData(attempts), [attempts]);
  const [module, setModule] = useState<ModuleFilter>("all");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeModule = filterOptions.includes(module) ? module : "all";

  const filtered = useMemo(
    () => filterAttempts(attempts, activeModule),
    [attempts, activeModule],
  );
  const showModule = activeModule === "all";
  const points = useMemo(
    () => buildPoints(filtered, showModule),
    [filtered, showModule],
  );
  const completed = filtered.filter(
    (a) => a.status === "completed" || a.completed_at,
  ).length;

  const latestBand = points.length > 0 ? points[points.length - 1].band : null;
  const prevBand =
    points.length > 1 ? points[points.length - 2].band : null;
  const delta =
    latestBand !== null && prevBand !== null
      ? Math.round((latestBand - prevBand) * 10) / 10
      : null;

  const bestBand = useMemo(() => {
    const bands = filtered
      .map((a) => a.band)
      .filter((b): b is number => b !== null);
    return bands.length ? Math.max(...bands) : null;
  }, [filtered]);

  const linePath = smoothLinePath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${CHART_H} L ${points[0].x},${CHART_H} Z`
      : "";

  const activePoint =
    hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  const targetY =
    CHART_H -
    PAD_Y -
    ((TARGET_BAND - MIN_BAND) / (MAX_BAND - MIN_BAND)) *
      (CHART_H - PAD_Y * 2);

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-cyan/12 bg-white shadow-[0_8px_32px_rgba(13,31,60,0.07)]">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-cyan/10 blur-3xl"
        aria-hidden
      />

      <header className="relative border-b border-ink/6 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D1F3C] to-teal text-white shadow-[0_4px_16px_rgba(0,151,167,0.3)]">
              <ChartIcon className="size-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-[15px] font-bold tracking-tight text-ink">
                Recent performance
              </h2>
              <p className="mt-0.5 text-[12px] text-ink/45">
                Band trend across your last mocks
              </p>
            </div>
          </div>
          <ModulePills
            value={activeModule}
            onChange={setModule}
            options={filterOptions}
          />
        </div>

        {points.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                  Latest
                </p>
                <p className="font-display text-4xl font-bold tabular-nums leading-none text-teal">
                  {formatBand(latestBand)}
                </p>
              </div>
              <DeltaBadge delta={delta} />
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                  Best
                </p>
                <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-ink">
                  {formatBand(bestBand)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                  Avg
                </p>
                <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-ink/70">
                  {formatBand(averageBand)}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <div className="relative flex-1 px-4 py-4 sm:px-5">
        {points.length === 0 ? (
          <BfEmptyState
            variant="no-tests"
            title="No scores yet"
            description="Complete a mock to see your band trend light up here."
            actionLabel="Start a mock"
            actionHref="/test/listening"
            className="min-h-[11rem] border-dashed"
          />
        ) : (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0D1F3C] via-[#122843] to-[#091525] p-3 ring-1 ring-white/10 sm:p-4">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,188,212,0.12),transparent_55%)]"
              aria-hidden
            />

            {activePoint ? (
              <output className="pointer-events-none absolute left-1/2 top-2 z-10 block -translate-x-1/2 rounded-xl border border-white/15 bg-[#0D1F3C]/95 px-4 py-2.5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: activePoint.color }}
                  />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                    {activePoint.label}
                  </p>
                </div>
                <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-white">
                  {activePoint.band.toFixed(1)}
                </p>
                <p className="max-w-[220px] truncate text-[11px] text-white/55">
                  {activePoint.title}
                </p>
              </output>
            ) : null}

            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              className="relative z-[1] h-48 w-full touch-pan-x"
              role="img"
              aria-label="Band score trend chart"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient
                  id={gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={SIGNAL_CYAN} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={SIGNAL_CYAN} stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id={`line-${gradientId}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor={SIGNAL_CYAN} />
                  <stop offset="100%" stopColor={FORGE_TEAL} />
                </linearGradient>
                <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {[3, 4.5, 6, 7.5, 9].map((band) => {
                const y =
                  CHART_H -
                  PAD_Y -
                  ((band - MIN_BAND) / (MAX_BAND - MIN_BAND)) *
                    (CHART_H - PAD_Y * 2);
                const isTarget = band === TARGET_BAND;
                return (
                  <g key={band}>
                    <line
                      x1={PAD_X}
                      y1={y}
                      x2={CHART_W - PAD_X}
                      y2={y}
                      stroke="white"
                      strokeOpacity={isTarget ? 0.18 : 0.06}
                      strokeDasharray={isTarget ? "5 4" : undefined}
                    />
                    <text
                      x={PAD_X - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fontWeight={isTarget ? 600 : 500}
                      fill="white"
                      fillOpacity={isTarget ? 0.55 : 0.28}
                    >
                      {band % 1 === 0 ? band : band.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              <line
                x1={PAD_X}
                y1={targetY}
                x2={CHART_W - PAD_X}
                y2={targetY}
                stroke="#FBBF24"
                strokeOpacity={0.35}
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text
                x={CHART_W - PAD_X + 4}
                y={targetY + 3}
                fontSize="8"
                fontWeight="600"
                fill="#FBBF24"
                fillOpacity={0.7}
              >
                6.0
              </text>

              {areaPath ? (
                <path d={areaPath} fill={`url(#${gradientId})`} />
              ) : null}

              {linePath ? (
                <path
                  d={linePath}
                  fill="none"
                  stroke={`url(#line-${gradientId})`}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${glowId})`}
                />
              ) : null}

              {points.map((p, i) => {
                const active = hoverIndex === i;
                const isLast = i === points.length - 1;
                return (
                  <g
                    key={`${p.label}-${p.module}-${i}`}
                    onMouseEnter={() => setHoverIndex(i)}
                    className="cursor-pointer"
                  >
                    {active ? (
                      <line
                        x1={p.x}
                        y1={PAD_Y}
                        x2={p.x}
                        y2={CHART_H - PAD_Y}
                        stroke="white"
                        strokeOpacity={0.12}
                        strokeDasharray="3 3"
                      />
                    ) : null}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={active ? 16 : 12}
                      fill={p.color}
                      fillOpacity={active ? 0.2 : 0}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={active ? 6 : 4.5}
                      fill={FORGE_NAVY}
                      stroke={p.color}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {isLast && hoverIndex === null ? (
                      <text
                        x={p.x}
                        y={p.y - 14}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill="white"
                      >
                        {p.band.toFixed(1)}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>

            <div className="relative z-[1] mt-1 flex justify-between gap-0.5 px-1">
              {points.map((p, i) => (
                <span
                  key={`${p.label}-${i}`}
                  className={cn(
                    "min-w-0 flex-1 truncate text-center text-[9px] font-medium text-white/30",
                    hoverIndex === i && "font-semibold text-white/70",
                    i % 2 === 1 && points.length > 5 && "hidden sm:block",
                  )}
                >
                  {p.label}
                </span>
              ))}
            </div>

            {showModule && points.length > 0 ? (
              <div className="relative z-[1] mt-3 flex flex-wrap justify-center gap-3 border-t border-white/8 pt-3">
                {(
                  Object.entries(MODULE_CHART_COLORS) as [DashboardModule, string][]
                ).map(([mod, color]) => (
                  <span
                    key={mod}
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium text-white/45"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {MODULE_LABELS[mod]}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/6 bg-surface/50 px-5 py-3">
        <p className="text-[12px] text-ink/45">
          <span className="font-semibold tabular-nums text-ink">
            {completed}
          </span>{" "}
          completed
          {activeModule !== "all" ? (
            <>
              {" "}
              ·{" "}
              <span className="text-ink/60">
                {MODULE_LABELS[activeModule as DashboardModule]}
              </span>
            </>
          ) : null}
        </p>
        <Link
          href="/scores"
          className="group inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-cyan transition-colors duration-200 hover:bg-cyan/8 hover:text-teal"
        >
          Full breakdown
          <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </footer>
    </section>
  );
}
