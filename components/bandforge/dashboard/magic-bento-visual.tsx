"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import type {
  MagicBentoHeatDay,
  MagicBentoVisual,
} from "@/components/bandforge/dashboard/magic-bento-types";

function ProgressTrack({ pct }: { pct: number }) {
  return (
    <div className="magic-bento-visual__track">
      <div
        className="magic-bento-visual__fill"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  );
}

/** Ease chart values in after mount so CSS transitions can play. */
function useAnimatedPct(target: number, delayMs = 40): number {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      setPct(target);
      return;
    }
    setPct(0);
    const id = window.setTimeout(() => setPct(target), delayMs);
    return () => window.clearTimeout(id);
  }, [target, delayMs, reduce]);

  return pct;
}

/** Practice — % + title, then bar. Description lives under the bar in the card. */
function HeroMetric({
  value,
  caption,
  pct,
  title,
}: {
  value: string;
  caption: string;
  pct: number;
  title?: string;
}) {
  const animated = useAnimatedPct(pct);
  return (
    <div className="magic-bento-visual magic-bento-visual--hero">
      <div className="magic-bento-visual__hero-top">
        <p className="magic-bento-visual__hero-value">{value}</p>
        <p className="magic-bento-visual__caption magic-bento-visual__caption--right">
          {caption}
        </p>
      </div>
      {title ? <h2 className="magic-bento-card__title">{title}</h2> : null}
      <div className="magic-bento-visual__bar-slot">
        <ProgressTrack pct={animated} />
      </div>
    </div>
  );
}

/** Band progress — Now → Target with one shared bar. */
function BandMetric({
  current,
  target,
  pct,
  title,
}: {
  current: string;
  target: string;
  pct: number;
  title?: string;
}) {
  const animated = useAnimatedPct(pct);
  return (
    <div className="magic-bento-visual magic-bento-visual--band">
      <div className="magic-bento-visual__band-head">
        <div className="magic-bento-visual__band-stat">
          <span className="magic-bento-visual__band-kicker">Now</span>
          <span className="magic-bento-visual__band-num">{current}</span>
        </div>
        <span className="magic-bento-visual__band-arrow" aria-hidden>
          →
        </span>
        <div className="magic-bento-visual__band-stat magic-bento-visual__band-stat--end">
          <span className="magic-bento-visual__band-kicker">Target</span>
          <span className="magic-bento-visual__band-num magic-bento-visual__band-num--target">
            {target}
          </span>
        </div>
      </div>
      {title ? <h2 className="magic-bento-card__title">{title}</h2> : null}
      <div className="magic-bento-visual__bar-slot">
        <ProgressTrack pct={animated} />
      </div>
    </div>
  );
}

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function heatLevel(count: number, empty: boolean, future: boolean): number {
  if (empty || future || count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function MonthHeatmap({
  days,
  monthLabel,
}: {
  days: MagicBentoHeatDay[];
  monthLabel: string;
}) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(Boolean(reduce));

  useEffect(() => {
    if (reduce) {
      setReady(true);
      return;
    }
    setReady(false);
    const id = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(id);
  }, [reduce, days]);

  return (
    <div
      className="magic-bento-visual__heat"
      role="img"
      aria-label={`${monthLabel} activity`}
    >
      <div className="magic-bento-visual__heat-weekdays" aria-hidden>
        {WEEKDAY_LETTERS.map((letter, i) => (
          <span key={`${letter}-${i}`}>{letter}</span>
        ))}
      </div>
      <div className="magic-bento-visual__heat-grid">
        {days.map((day, i) => {
          const level = heatLevel(day.count, day.empty, day.future);
          return (
            <span
              key={day.key}
              className={[
                "magic-bento-visual__heat-cell",
                `is-l${level}`,
                day.empty ? "is-empty" : "",
                day.isToday ? "is-today" : "",
                day.future ? "is-future" : "",
                ready ? "is-ready" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                transitionDelay: reduce ? "0ms" : `${Math.min(i, 28) * 18}ms`,
              }}
              title={
                day.empty
                  ? undefined
                  : day.future
                    ? undefined
                    : `${day.key} · ${day.count} ${day.count === 1 ? "session" : "sessions"}`
              }
            />
          );
        })}
      </div>
    </div>
  );
}

/** Streak — current days + this month’s activity heatmap. */
function StreakMetric({
  current,
  longest,
  nextMilestone,
  monthLabel,
  days,
}: {
  current: number;
  longest: number;
  nextMilestone: number;
  monthLabel: string;
  days: MagicBentoHeatDay[];
}) {
  const caption =
    current > 0
      ? longest > current
        ? `Best ${longest} · ${monthLabel}`
        : `Next ${nextMilestone} · ${monthLabel}`
      : `${monthLabel} · practice to start`;
  return (
    <div className="magic-bento-visual magic-bento-visual--hero magic-bento-visual--streak">
      <div className="magic-bento-visual__hero-top">
        <p className="magic-bento-visual__hero-value">
          {current}
          <span className="magic-bento-visual__hero-unit">d</span>
        </p>
        <p className="magic-bento-visual__caption magic-bento-visual__caption--right">
          streak
        </p>
      </div>
      <MonthHeatmap days={days} monthLabel={monthLabel} />
      <p className="magic-bento-visual__caption magic-bento-visual__caption--left">
        {caption}
      </p>
    </div>
  );
}

function RowBars({
  rows,
}: {
  rows: Array<{
    key: string;
    label: string;
    pct: number;
    badge: string;
    open?: boolean;
  }>;
}) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(Boolean(reduce));

  useEffect(() => {
    if (reduce) {
      setReady(true);
      return;
    }
    setReady(false);
    const id = window.setTimeout(() => setReady(true), 50);
    return () => window.clearTimeout(id);
  }, [reduce, rows]);

  return (
    <div className="magic-bento-visual magic-bento-visual--rows">
      <div className="magic-bento-visual__hub-rows">
        {rows.map((bar) => (
          <div key={bar.key} className="magic-bento-visual__hub-row">
            <span className="magic-bento-visual__hub-name">{bar.label}</span>
            <ProgressTrack pct={ready ? bar.pct : 0} />
            <span
              className={`magic-bento-visual__hub-badge${bar.open ? " is-open" : ""}`}
            >
              {bar.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MagicBentoCardVisual({
  visual,
  title,
}: {
  visual: MagicBentoVisual;
  /** Practice: title sits above the bar. */
  title?: string;
}) {
  switch (visual.kind) {
    case "cta":
      return (
        <HeroMetric
          value={visual.ready ? `${visual.progress}%` : "✓"}
          pct={visual.progress}
          caption={
            visual.ready ? "Done today" : "Today’s plan complete"
          }
          title={title}
        />
      );

    case "gap":
      return (
        <BandMetric
          current={
            visual.current != null ? visual.current.toFixed(1) : "—"
          }
          target={visual.target.toFixed(1)}
          pct={visual.pct}
          title={title}
        />
      );

    case "streak":
      return (
        <StreakMetric
          current={visual.current}
          longest={visual.longest}
          nextMilestone={visual.nextMilestone}
          monthLabel={visual.monthLabel}
          days={visual.days}
        />
      );

    case "skills":
      return (
        <RowBars
          rows={visual.bars.map((bar) => ({
            key: bar.key,
            label: bar.label,
            pct: bar.pct,
            badge:
              bar.value != null && bar.value > 0
                ? bar.value.toFixed(1)
                : "—",
          }))}
        />
      );

    case "hubs":
      return (
        <RowBars
          rows={visual.bars.map((bar) => ({
            key: bar.key,
            label: bar.label,
            pct: bar.pct,
            badge: bar.unlocked ? "Open" : `${bar.pct}%`,
            open: bar.unlocked,
          }))}
        />
      );

    case "week": {
      return <WeekVisual visual={visual} />;
    }

    case "writing":
      return (
        <HeroMetric
          value={`${visual.completed}/${visual.total}`}
          pct={visual.pct}
          caption={
            visual.mockUnlocked
              ? "Mock unlocked"
              : visual.completed > 0
                ? `${visual.pct}% complete`
                : "Hubs not started"
          }
          title={title}
        />
      );

    default:
      return null;
  }
}

function WeekVisual({
  visual,
}: {
  visual: Extract<MagicBentoVisual, { kind: "week" }>;
}) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(Boolean(reduce));
  const weekPct = useAnimatedPct(visual.pct ?? 0);

  useEffect(() => {
    if (reduce) {
      setReady(true);
      return;
    }
    setReady(false);
    const id = window.setTimeout(() => setReady(true), 60);
    return () => window.clearTimeout(id);
  }, [reduce, visual.bars, visual.pct]);

  return (
    <div className="magic-bento-visual magic-bento-visual--week">
      <div className="magic-bento-visual__bar-slot">
        <ProgressTrack pct={weekPct} />
      </div>
      <div className="magic-bento-visual__week-grid" role="list">
        {visual.bars.map((bar, i) => (
          <div
            key={`${bar.letter}-${i}`}
            role="listitem"
            className={`magic-bento-visual__week-day${bar.isToday ? " is-today" : ""}`}
          >
            <div className="magic-bento-visual__week-track">
              <div
                className="magic-bento-visual__week-fill"
                style={{
                  height: ready ? `${Math.max(0, Math.min(100, bar.pct))}%` : "0%",
                  transitionDelay: reduce ? "0ms" : `${i * 45}ms`,
                }}
              />
            </div>
            <span className="magic-bento-visual__week-letter">{bar.letter}</span>
          </div>
        ))}
      </div>
      <p className="magic-bento-visual__caption">
        {visual.total > 0
          ? `${visual.done}/${visual.total} focus tasks this week`
          : "No focus tasks yet"}
      </p>
    </div>
  );
}
