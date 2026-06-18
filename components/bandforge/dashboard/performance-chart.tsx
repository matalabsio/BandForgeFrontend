"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import type { DashboardRecentAttempt } from "@/components/bandforge/dashboard/types";
import { MODULE_LABELS } from "@/components/bandforge/dashboard/types";
import { DashboardCard } from "@/components/bandforge/dashboard/dashboard-card";
import {
  ArrowRightIcon,
  ChartIcon,
} from "@/components/bandforge/dashboard/icons";
import { BfEmptyState } from "@/components/bandforge/ui";
import { formatBand } from "@/components/bandforge/dashboard/utils";
import { formatDateShort } from "@/lib/date-format";
import { FORGE_TEAL, INK, SIGNAL_CYAN } from "@/lib/brand";
import { cn } from "@/lib/utils";

const CHART_W = 320;
const CHART_H = 128;
const PAD_X = 28;
const PAD_Y = 14;
const MIN_BAND = 0;
const MAX_BAND = 9;

type Point = {
  x: number;
  y: number;
  band: number;
  label: string;
  title: string;
};

type ModuleFilter = "all" | "listening" | "reading";

function buildPoints(attempts: DashboardRecentAttempt[]): Point[] {
  const withBand = attempts
    .filter((a) => a.band !== null && (a.completed_at || a.status === "completed"))
    .slice()
    .reverse()
    .slice(-8);

  if (withBand.length === 0) return [];

  const n = withBand.length;
  const innerW = CHART_W - PAD_X * 2;
  const innerH = CHART_H - PAD_Y * 2;

  return withBand.map((a, i) => {
    const band = a.band ?? 0;
    const x = PAD_X + (i / Math.max(1, n - 1)) * innerW;
    const y =
      CHART_H -
      PAD_Y -
      ((band - MIN_BAND) / (MAX_BAND - MIN_BAND)) * innerH;
    return {
      x,
      y,
      band,
      label: formatDateShort(a.completed_at ?? a.started_at),
      title: a.mock_test.title,
    };
  });
}

function modulesWithData(attempts: DashboardRecentAttempt[]): ModuleFilter[] {
  const mods = new Set(attempts.map((a) => a.module));
  const filters: ModuleFilter[] = ["all"];
  if (mods.has("listening")) filters.push("listening");
  if (mods.has("reading")) filters.push("reading");
  return filters;
}

function filterAttempts(
  attempts: DashboardRecentAttempt[],
  module: ModuleFilter,
): DashboardRecentAttempt[] {
  if (module === "all") return attempts;
  return attempts.filter((a) => a.module === module);
}

function ModulePills({
  value,
  onChange,
  options,
  className,
}: {
  value: ModuleFilter;
  onChange: (v: ModuleFilter) => void;
  options: ModuleFilter[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-fit max-w-full rounded-xl border border-ink/8 bg-surface p-0.5",
        className,
      )}
      role="tablist"
      aria-label="Filter by module"
    >
      {options.map((key) => {
        const label =
          key === "all" ? "All" : (MODULE_LABELS[key as keyof typeof MODULE_LABELS] ?? key);
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={cn(
              "cursor-pointer rounded-[10px] px-2.5 py-1 text-[11px] font-semibold transition-colors duration-200",
              active
                ? "bg-white text-ink shadow-[0_1px_4px_rgba(15,23,42,0.08)]"
                : "text-ink/50 hover:text-ink/75",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 flex-1 rounded-xl border px-3 py-2.5",
        accent
          ? "border-cyan/25 bg-gradient-to-br from-cyan/10 to-white"
          : "border-ink/6 bg-surface",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-display text-xl font-bold tabular-nums tracking-tight",
          accent ? "text-teal" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
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
  const filterOptions = useMemo(() => modulesWithData(attempts), [attempts]);
  const [module, setModule] = useState<ModuleFilter>(() =>
    filterOptions.includes("listening") ? "listening" : "all",
  );
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => filterAttempts(attempts, module),
    [attempts, module],
  );
  const points = useMemo(() => buildPoints(filtered), [filtered]);
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

  const linePath =
    points.length > 1
      ? `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`
      : points.length === 1
        ? `M ${points[0].x - 24},${points[0].y} L ${points[0].x + 24},${points[0].y}`
        : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${CHART_H} L ${points[0].x},${CHART_H} Z`
      : "";

  const activePoint =
    hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <DashboardCard className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-ink/6 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan to-teal text-white shadow-[0_4px_14px_rgba(6,182,212,0.35)]">
              <ChartIcon className="size-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold tracking-tight text-ink">
                Recent performance
              </h2>
              <p className="mt-0.5 text-[12px] text-ink/45">
                Band trend from your last mocks
              </p>
            </div>
          </div>
          <ModulePills
            value={module}
            onChange={setModule}
            options={filterOptions}
            className="sm:ml-auto"
          />
        </div>

        {points.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatPill
              label="Latest"
              value={formatBand(latestBand)}
              accent
            />
            <StatPill
              label="Change"
              value={
                delta === null
                  ? "—"
                  : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`
              }
            />
            <StatPill label="Best" value={formatBand(bestBand)} />
          </div>
        ) : null}
      </header>

      <div className="relative flex-1 px-4 pb-2 pt-4 sm:px-5">
        {points.length === 0 ? (
          <BfEmptyState
            variant="no-tests"
            title="No scores yet"
            description="Finish a listening mock to see your band trend and progress over time."
            actionLabel="Start a mock"
            actionHref="/test/listening"
            className="min-h-[11rem] border-dashed"
          />
        ) : (
          <>
            {activePoint ? (
              <output
                className="pointer-events-none absolute left-1/2 top-3 z-10 block -translate-x-1/2 rounded-lg border border-ink/8 bg-white px-3 py-2 text-center shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/40">
                  {activePoint.label}
                </p>
                <p className="text-lg font-bold tabular-nums text-teal">
                  Band {activePoint.band.toFixed(1)}
                </p>
                <p className="max-w-[200px] truncate text-[11px] text-ink/55">
                  {activePoint.title}
                </p>
              </output>
            ) : null}

            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              className="h-44 w-full touch-pan-x"
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
                  <stop offset="0%" stopColor={SIGNAL_CYAN} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={SIGNAL_CYAN} stopOpacity="0" />
                </linearGradient>
              </defs>

              {[3, 4.5, 6, 7.5, 9].map((band) => {
                const y =
                  CHART_H -
                  PAD_Y -
                  ((band - MIN_BAND) / (MAX_BAND - MIN_BAND)) *
                    (CHART_H - PAD_Y * 2);
                return (
                  <g key={band}>
                    <line
                      x1={PAD_X}
                      y1={y}
                      x2={CHART_W - PAD_X}
                      y2={y}
                      stroke={INK}
                      strokeOpacity={band === 6 ? 0.1 : 0.05}
                      strokeDasharray={band === 6 ? "4 4" : undefined}
                    />
                    <text
                      x={PAD_X - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fontWeight={band === 6 ? 600 : 500}
                      fill={INK}
                      fillOpacity={band === 6 ? 0.4 : 0.28}
                    >
                      {band % 1 === 0 ? band : band.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {areaPath ? (
                <path d={areaPath} fill={`url(#${gradientId})`} />
              ) : null}

              {linePath ? (
                <path
                  d={linePath}
                  fill="none"
                  stroke={SIGNAL_CYAN}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {points.map((p, i) => {
                const active = hoverIndex === i;
                return (
                  <g
                    key={`${p.label}-${i}`}
                    onMouseEnter={() => setHoverIndex(i)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={active ? 14 : 10}
                      fill={SIGNAL_CYAN}
                      fillOpacity={active ? 0.15 : 0}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={active ? 6 : 4.5}
                      fill="#fff"
                      stroke={SIGNAL_CYAN}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {i === points.length - 1 && hoverIndex === null ? (
                      <text
                        x={p.x}
                        y={p.y - 12}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill={FORGE_TEAL}
                      >
                        {p.band.toFixed(1)}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>

            <div className="mt-2 flex justify-between gap-1 px-1">
              {points.map((p, i) => (
                <span
                  key={`${p.label}-${i}`}
                  className={cn(
                    "min-w-0 flex-1 truncate text-center text-[9px] font-medium text-ink/35",
                    i % 2 === 1 && points.length > 4 && "hidden sm:block",
                    hoverIndex === i && "text-teal",
                  )}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/6 bg-surface/60 px-5 py-3">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
          <span>
            <span className="text-ink/45">Avg. band </span>
            <span className="font-bold tabular-nums text-ink">
              {formatBand(averageBand)}
            </span>
          </span>
          <span>
            <span className="text-ink/45">Completed </span>
            <span className="font-bold tabular-nums text-ink">
              {completed}
            </span>
          </span>
        </div>
        <Link
          href="/scores"
          className="group inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold text-cyan transition-colors duration-200 hover:bg-cyan/8 hover:text-teal"
        >
          Full breakdown
          <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </footer>
    </DashboardCard>
  );
}
