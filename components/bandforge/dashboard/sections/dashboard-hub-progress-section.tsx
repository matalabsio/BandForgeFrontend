import Link from "next/link";
import { Lock, Unlock } from "lucide-react";
import type { LearningProfile, LearningStudyPlan } from "@/lib/learning-types";
import { cn } from "@/lib/utils";

const SKILL_ORDER = [
  { key: "listening", label: "Listening" },
  { key: "reading", label: "Reading" },
  { key: "writing", label: "Writing" },
  { key: "speaking", label: "Speaking" },
] as const;

type Props = {
  learning: LearningProfile;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function overallPlanPercent(plan: LearningStudyPlan): number {
  const skillModules = ["listening", "reading", "writing", "speaking"];
  const today = todayIso();
  let done = 0;
  let total = 0;

  for (const week of plan.weeks) {
    for (const day of week.days) {
      if (day.date > today) continue;
      for (const task of day.tasks) {
        if (!skillModules.includes(task.module)) continue;
        total += 1;
        if (task.status === "done") done += 1;
      }
    }
  }

  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function DashboardHubProgressSection({ learning }: Props) {
  const hubProgress = learning.hub_progress ?? {};
  const overallPct = overallPlanPercent(learning.study_plan);

  return (
    <section className="bf-dash-enter">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <p className="font-mono text-xs tracking-[0.1em] text-muted-light uppercase">
          Study plan progress
        </p>
        <p className="text-[12px] font-semibold text-cyan sm:text-[13px]">
          Overall plan {overallPct}%
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SKILL_ORDER.map(({ key, label }) => {
          const row = hubProgress[key];
          const completed = row?.completed_count ?? 0;
          const total = row?.total_count ?? 12;
          const pct =
            total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
          const mockUnlocked = row?.mock_unlocked ?? false;

          return (
            <Link
              key={key}
              href={`/practice/${key}`}
              className="rounded-2xl border border-border-soft bg-white px-4 py-4 transition-colors hover:border-cyan/40 sm:px-5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-display text-sm font-bold text-navy">{label}</p>
                <span className="font-mono text-xs font-semibold text-cyan">
                  {completed} / {total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border-soft">
                <div
                  className="h-full rounded-full bg-cyan transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                    mockUnlocked
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-ink/5 text-ink/55",
                  )}
                >
                  {mockUnlocked ? (
                    <Unlock className="size-3" strokeWidth={2.5} />
                  ) : (
                    <Lock className="size-3" strokeWidth={2.5} />
                  )}
                  Mock {mockUnlocked ? "unlocked" : "locked"}
                </span>
                <span className="text-[11px] font-semibold text-cyan">
                  Open practice →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
