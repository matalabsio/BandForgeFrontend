"use client";

import Link from "next/link";
import type { LearningProfile } from "@/lib/learning-types";

type Props = {
  learning: LearningProfile | null;
  streakDays: number;
};

function weekPlanStats(learning: LearningProfile | null): {
  done: number;
  total: number;
  hubs: number;
} {
  if (!learning) return { done: 0, total: 0, hubs: 0 };
  const today = new Date();
  const monday = new Date(today);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const start = toKey(monday);
  const end = toKey(sunday);

  let done = 0;
  let total = 0;
  for (const week of learning.study_plan?.weeks ?? []) {
    for (const day of week.days ?? []) {
      if (day.date < start || day.date > end) continue;
      for (const t of day.tasks ?? []) {
        if (t.status === "skipped") continue;
        total += 1;
        if (t.status === "done") done += 1;
      }
    }
  }

  let hubs = 0;
  const hp = learning.hub_progress ?? {};
  for (const skill of Object.keys(hp)) {
    const row = hp[skill as keyof typeof hp];
    if (row && typeof row === "object" && "completed_count" in row) {
      hubs += Number((row as { completed_count?: number }).completed_count) || 0;
    }
  }

  return { done, total, hubs };
}

export function ScoresCompletionAnalytics({ learning, streakDays }: Props) {
  const { done, total, hubs } = weekPlanStats(learning);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-2xl border border-border-soft bg-white p-4">
        <p className="font-mono text-[0.65rem] tracking-wider text-muted-light uppercase">
          Plan this week
        </p>
        <p className="font-display mt-1 text-2xl font-bold text-navy">
          {total > 0 ? `${pct}%` : "—"}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {done}/{total || 0} tasks done
        </p>
      </div>
      <div className="rounded-2xl border border-border-soft bg-white p-4">
        <p className="font-mono text-[0.65rem] tracking-wider text-muted-light uppercase">
          Hub completions
        </p>
        <p className="font-display mt-1 text-2xl font-bold text-navy">{hubs}</p>
        <p className="mt-0.5 text-xs text-muted">Across all skills</p>
      </div>
      <div className="rounded-2xl border border-border-soft bg-white p-4">
        <p className="font-mono text-[0.65rem] tracking-wider text-muted-light uppercase">
          Streak
        </p>
        <p className="font-display mt-1 text-2xl font-bold text-navy">{streakDays}</p>
        <p className="mt-0.5 text-xs text-muted">Days in a row</p>
      </div>
      <div className="rounded-2xl border border-border-soft bg-white p-4">
        <p className="font-mono text-[0.65rem] tracking-wider text-muted-light uppercase">
          Today
        </p>
        <p className="font-display mt-1 text-2xl font-bold text-navy">
          {(learning?.todays_tasks ?? []).filter((t) => t.status === "done").length}
          <span className="text-base font-medium text-muted">
            /
            {(learning?.todays_tasks ?? []).filter((t) => t.status !== "skipped").length || 0}
          </span>
        </p>
        <Link
          href="/study-plan/today"
          className="mt-0.5 text-xs font-semibold text-teal hover:underline"
        >
          Open today →
        </Link>
      </div>
    </section>
  );
}
