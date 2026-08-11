"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { FlameIcon } from "@/components/bandforge/dashboard/icons";
import { StreakContributionCalendar } from "@/components/bandforge/streak/streak-contribution-calendar";
import { examApiCall } from "@/lib/exam-api-call";
import { cn } from "@/lib/utils";

type ActivityDay = { date: string; count: number };

type StreakPayload = {
  current_streak: number;
  longest_streak: number;
  activity_days: ActivityDay[];
  week_active_days: number;
  prep_start: string | null;
  exam_date: string | null;
};

const MILESTONES = [3, 7, 14, 30, 60, 100];

function toPayload(
  data: Partial<StreakPayload> | null | undefined,
): StreakPayload {
  return {
    current_streak: Number(data?.current_streak) || 0,
    longest_streak: Number(data?.longest_streak) || 0,
    activity_days: Array.isArray(data?.activity_days) ? data.activity_days : [],
    week_active_days: Number(data?.week_active_days) || 0,
    prep_start: data?.prep_start?.slice(0, 10) || null,
    exam_date: data?.exam_date?.slice(0, 10) || null,
  };
}

type Props = {
  initial?: Partial<StreakPayload> | null;
};

export function StreakTrackerExperience({ initial = null }: Props) {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<StreakPayload>(() => toPayload(initial));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await examApiCall<StreakPayload>("/api/dashboard/streak");
        if (!cancelled) {
          setData(toPayload(json));
          setError(null);
        }
      } catch (e) {
        if (!cancelled && !initial) {
          setError(e instanceof Error ? e.message : "Failed to load streak");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const current = data.current_streak;
  const longest = data.longest_streak;
  const nextMilestone =
    MILESTONES.find((m) => m > current) ?? MILESTONES[MILESTONES.length - 1];
  const toMilestone = Math.max(0, nextMilestone - current);
  const progress = Math.min(100, Math.round((current / nextMilestone) * 100));

  const insight =
    current <= 0
      ? "Complete today’s plan or a practice hub to light up today on the calendar."
      : current >= longest && current > 1
        ? `Best run yet — ${current} days. Practice today to keep the grid going.`
        : `${data.week_active_days} active day${data.week_active_days === 1 ? "" : "s"} this week. Best ever: ${longest}.`;

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6" aria-busy>
        <div className="h-8 w-28 animate-pulse rounded-lg bg-ink/[0.06]" />
        <div className="h-40 animate-pulse rounded-[24px] bg-ink/[0.06]" />
        <div className="h-44 animate-pulse rounded-[24px] bg-ink/[0.06]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <p className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-800">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6">
      <header className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
          Habits
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
          Streak
        </h1>
        <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-muted">
          Practice from prep start through your exam date. Darker means more
          that day.
        </p>
      </header>

      <section className="overflow-hidden rounded-[24px] border border-ink/8 bg-white p-5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:items-stretch sm:gap-6">
          <div className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl bg-navy p-5 text-white sm:p-6">
            <div className="flex items-center gap-2 text-cyan">
              <FlameIcon className="size-5" aria-hidden />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                Current streak
              </p>
            </div>
            <div>
              <p className="font-mono text-[3rem] leading-none font-medium tracking-tight sm:text-[3.25rem]">
                {current}
              </p>
              <p className="mt-1.5 text-[14px] text-white/70">
                {current === 1 ? "day in a row" : "days in a row"}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-3">
            <StatTile label="Best" value={longest} unit="days" />
            <StatTile
              label="This week"
              value={data.week_active_days}
              unit="active"
            />
            <StatTile
              label="Next goal"
              value={toMilestone}
              unit={toMilestone === 1 ? "day left" : "days left"}
            />
          </dl>
        </div>
      </section>

      <section
        className="rounded-[24px] border border-ink/8 bg-white p-4 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] sm:p-6"
        aria-labelledby="streak-calendar-heading"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="streak-calendar-heading"
              className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
            >
              Activity
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {data.exam_date
                ? `Until exam · ${new Date(`${data.exam_date}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`
                : "Your prep window"}
              {" · tap a day"}
            </p>
          </div>
        </div>
        <StreakContributionCalendar
          days={data.activity_days}
          currentStreak={current}
          prepStart={data.prep_start}
          examDate={data.exam_date}
        />
      </section>

      <section className="rounded-[24px] border border-ink/8 bg-white p-5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
            Next milestone
          </h2>
          <p className="font-mono text-[12px] font-semibold tabular-nums text-muted">
            {current}/{nextMilestone}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r from-teal to-cyan",
              !reduceMotion && "transition-[width] duration-300 ease-out",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-[13px] text-muted">{insight}</p>
        <Link
          href="/study-plan/today"
          className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan px-5 text-[14px] font-bold text-navy transition-colors duration-200 hover:bg-brand-sky-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:w-auto sm:min-w-[200px]"
        >
          Open today’s plan
          <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
        </Link>
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-2xl bg-ink/[0.04] px-2.5 py-3 text-center sm:px-4 sm:py-3.5 sm:text-left">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-light">
        {label}
      </dt>
      <dd className="mt-1 flex flex-col items-center gap-0.5 sm:flex-row sm:items-baseline sm:gap-1.5">
        <span className="font-mono text-lg font-semibold tabular-nums text-ink sm:text-xl">
          {value}
        </span>
        <span className="text-[11px] text-muted sm:text-[12px]">{unit}</span>
      </dd>
    </div>
  );
}
