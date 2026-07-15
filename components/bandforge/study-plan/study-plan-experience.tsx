"use client";

import { useMemo, useState, useTransition } from "react";
import { Calendar, Check } from "lucide-react";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { patchLearningTask } from "@/lib/learning-api";
import type {
  LearningProfile,
  LearningStudyPlan,
  LearningStudyTask,
} from "@/lib/learning-types";
import { cn } from "@/lib/utils";

const MODULE_COLORS: Record<string, string> = {
  listening: "border-l-cyan",
  reading: "border-l-cyan",
  writing: "border-l-[#b7791f]",
  speaking: "border-l-[#3b6fb0]",
  vocabulary: "border-l-[#7c5cbf]",
  grammar: "border-l-[#b7791f]",
};

const MODULE_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
};

type Props = {
  profile: LearningProfile;
};

function formatDayHeader(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(`${iso}T12:00:00`));
  } catch {
    return iso;
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function countProgress(plan: LearningStudyPlan): { done: number; total: number } {
  let done = 0;
  let total = 0;
  const today = todayIso();
  for (const week of plan.weeks) {
    for (const day of week.days) {
      if (day.date !== today) continue;
      for (const task of day.tasks) {
        if (task.status === "skipped") continue;
        total += 1;
        if (task.status === "done") done += 1;
      }
    }
  }
  return { done, total };
}

export function StudyPlanExperience({ profile }: Props) {
  const [plan, setPlan] = useState<LearningStudyPlan>(profile.study_plan);
  const [weekId, setWeekId] = useState(plan.weeks[0]?.id ?? "w1");
  const [pending, startTransition] = useTransition();

  const activeWeek = plan.weeks.find((w) => w.id === weekId) ?? plan.weeks[0];
  const progress = useMemo(() => countProgress(plan), [plan]);
  const today = todayIso();

  function toggleTask(task: LearningStudyTask) {
    const nextStatus = task.status === "done" ? "pending" : "done";
    startTransition(async () => {
      try {
        const res = await patchLearningTask(task.id, nextStatus);
        setPlan(res.study_plan);
      } catch {
        // Keep prior plan on failure
      }
    });
  }

  const goals = profile.weekly_goals ?? [];

  return (
    <div className="space-y-8">
      <header>
        <BfSectionEyebrow>Your schedule</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Study plan</BfSectionHeading>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Calendar className="size-4 text-cyan" />
          Adaptive plan from your evaluations
          {profile.gap_to_target != null && profile.target_band != null
            ? ` · ${profile.gap_to_target > 0 ? `${profile.gap_to_target.toFixed(1)} below` : "at"} target ${profile.target_band.toFixed(1)}`
            : null}
        </p>
      </header>

      <article className="rounded-2xl border border-cyan/25 bg-cyan-soft/60 p-5">
        <p className="font-mono text-[0.6875rem] tracking-[0.1em] text-cyan uppercase">
          This week&apos;s focus
        </p>
        <p className="font-display mt-2 text-base font-bold text-navy">
          {plan.weekly_focus || activeWeek?.focus || "Complete your first practice to personalize this plan."}
        </p>
      </article>

      {goals.length > 0 ? (
        <section>
          <p className="mb-3 font-mono text-xs tracking-[0.1em] text-muted-light uppercase">
            Weekly goals
          </p>
          <ul className="space-y-2">
            {goals.map((g) => (
              <li
                key={g.id}
                className="rounded-xl border border-border-soft bg-white px-4 py-3 text-sm text-navy"
              >
                {g.title}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-navy">
            {activeWeek?.label ?? "This week"}
          </span>
          <span className="font-mono text-cyan">
            {progress.total > 0
              ? `${progress.done}/${progress.total} today`
              : "No tasks today"}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border-soft">
          <div
            className="h-full rounded-full bg-cyan transition-all"
            style={{
              width: `${
                progress.total > 0
                  ? Math.round((progress.done / progress.total) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {plan.weeks.length > 0 ? (
        <nav className="flex gap-6 border-b border-border-soft">
          {plan.weeks.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWeekId(w.id)}
              className={cn(
                "pb-3 text-sm font-semibold transition-colors",
                weekId === w.id
                  ? "border-b-2 border-cyan text-cyan"
                  : "text-muted hover:text-navy",
              )}
            >
              {w.label}
            </button>
          ))}
        </nav>
      ) : null}

      <ul className={cn("space-y-6", pending && "opacity-80")}>
        {(activeWeek?.days ?? []).map((day) => (
          <li key={day.date}>
            <div className="mb-3 flex items-center gap-3">
              <p className="font-display font-bold text-navy">
                {formatDayHeader(day.date)}
              </p>
              {day.date === today ? (
                <span className="rounded-full bg-cyan px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white">
                  Today
                </span>
              ) : null}
            </div>
            <ul className="space-y-2">
              {day.tasks.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border border-border-soft bg-white px-4 py-3 text-left border-l-4",
                      MODULE_COLORS[task.module] ?? "border-l-cyan",
                      task.status === "done" && "opacity-70",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded border",
                        task.status === "done"
                          ? "border-cyan bg-cyan text-white"
                          : "border-border-soft",
                      )}
                    >
                      {task.status === "done" ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-navy">{task.title}</p>
                      <p className="text-xs text-muted">
                        {MODULE_LABEL[task.module] ?? task.module}
                        {" · "}
                        {task.subtitle || `~${task.duration_min} min`}
                        {task.kind === "homework" ? " · Homework" : ""}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {profile.recommendations.length > 0 ? (
        <section>
          <p className="mb-3 font-mono text-xs tracking-[0.1em] text-muted-light uppercase">
            Practice suggestions
          </p>
          <ul className="space-y-2">
            {profile.recommendations.map((rec) => (
              <li
                key={rec.id}
                className="rounded-xl border border-border-soft bg-white px-4 py-3"
              >
                <a href={rec.href} className="text-sm font-semibold text-navy hover:text-cyan">
                  {rec.title}
                </a>
                <p className="mt-1 text-xs text-muted">{rec.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
