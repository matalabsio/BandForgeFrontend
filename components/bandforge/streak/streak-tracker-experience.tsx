"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FlameIcon } from "@/components/bandforge/dashboard/icons";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

type ActivityDay = { date: string; count: number };

type StreakPayload = {
  current_streak: number;
  longest_streak: number;
  activity_days: ActivityDay[];
  week_active_days: number;
};

const MILESTONES = [3, 7, 14, 30, 60, 100];

function weekdayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "narrow" });
}

function todayIsoLocal(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, "0");
  const day = String(n.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function StreakTrackerExperience() {
  const [data, setData] = useState<StreakPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/dashboard/streak`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as StreakPayload;
        if (!cancelled) {
          setData({
            current_streak: Number(json.current_streak) || 0,
            longest_streak: Number(json.longest_streak) || 0,
            activity_days: Array.isArray(json.activity_days)
              ? json.activity_days
              : [],
            week_active_days: Number(json.week_active_days) || 0,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load streak");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = todayIsoLocal();
  const weekStrip = useMemo(() => {
    const days = data?.activity_days ?? [];
    const last7 = days.slice(-7);
    if (last7.length >= 7) return last7;
    // pad if API returned fewer
    return last7;
  }, [data]);

  const current = data?.current_streak ?? 0;
  const longest = data?.longest_streak ?? 0;
  const nextMilestone =
    MILESTONES.find((m) => m > current) ?? MILESTONES[MILESTONES.length - 1];
  const progress = Math.min(100, Math.round((current / nextMilestone) * 100));

  const insight =
    current <= 0
      ? "Complete today’s study plan or a practice hub to start your streak — mocks and plan days both count."
      : current >= longest && current > 1
        ? `You’re on your best run — ${current} days. Keep today’s plan moving.`
        : `Nice consistency. ${week_active_days_label(data?.week_active_days)} this week. Longest ever: ${longest}.`;

  return (
    <div className="space-y-8">
      <header>
        <BfSectionEyebrow>Habits</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Streak tracker</BfSectionHeading>
        <p className="mt-2 text-sm text-muted">
          Active days include full mocks and study-plan / practice hub completions.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-muted-light">Loading streak…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-[#f5d9a8] bg-gradient-to-br from-[#fff8eb] via-white to-[#fff3db] p-8 text-center shadow-sm">
            <FlameIcon className="mx-auto size-14 text-[#e8a317]" />
            <p className="font-display mt-4 bg-gradient-to-r from-[#e8a317] to-[#f06b1d] bg-clip-text text-6xl font-extrabold text-transparent">
              {current}
            </p>
            <p className="mt-1 text-sm font-medium text-navy">
              day streak — keep it going!
            </p>
            <p className="mt-2 font-mono text-xs text-muted-light">
              Longest: {longest} days
            </p>
          </section>

          <section>
            <h2 className="font-display text-sm font-bold text-navy">This week</h2>
            <div className="mt-4 flex justify-between gap-2">
              {weekStrip.map((d) => {
                const active = (d.count || 0) > 0;
                const isToday = d.date === today;
                return (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full text-sm font-semibold",
                        active
                          ? "bg-cyan text-white"
                          : isToday
                            ? "animate-pulse border-2 border-cyan bg-white text-cyan"
                            : "bg-border-soft text-muted-light",
                      )}
                      title={`${d.date}: ${d.count} activities`}
                    >
                      {weekdayLabel(d.date)}
                    </div>
                  </div>
                );
              })}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border-soft bg-white p-4 text-center">
              <div>
                <dt className="font-mono text-lg text-cyan">
                  {data?.week_active_days ?? 0}
                </dt>
                <dd className="text-xs text-muted-light">Active days</dd>
              </div>
              <div>
                <dt className="font-mono text-lg text-cyan">{longest}</dt>
                <dd className="text-xs text-muted-light">Best streak</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border-soft bg-white p-6">
            <h2 className="font-display text-sm font-bold text-navy">Next milestone</h2>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-navy">{nextMilestone}-day streak</span>
                <span className="font-mono text-xs text-muted-light">
                  {nextMilestone} days
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-border-soft">
                <div
                  className="h-full rounded-full bg-cyan"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[0.625rem] text-muted-light">
                <span>{current}</span>
                <span>{nextMilestone}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-cyan/20 bg-cyan-soft/40 p-5">
            <p className="text-sm leading-relaxed text-muted">{insight}</p>
            <Link
              href="/study-plan/today"
              className="mt-3 inline-block text-sm font-semibold text-teal hover:underline"
            >
              Open today’s plan →
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

function week_active_days_label(n: number | undefined): string {
  const v = n ?? 0;
  return `${v} active day${v === 1 ? "" : "s"}`;
}
