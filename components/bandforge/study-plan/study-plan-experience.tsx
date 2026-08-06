"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Calendar, Check, Lock } from "lucide-react";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { patchLearningTask } from "@/lib/learning-api";
import type {
  LearningProfile,
  LearningStudyDay,
  LearningStudyPlan,
  LearningStudyTask,
} from "@/lib/learning-types";
import {
  countMissedDays,
  dayStatus,
  dayStatusLabel,
  isDayAccessible,
  isDayAfterExam,
  todayIso,
  type DayAccessStatus,
} from "@/lib/study-plan-calendar";
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

const STATUS_CHIP: Record<DayAccessStatus, string> = {
  locked: "bg-ink/5 text-ink/45",
  today: "bg-cyan text-white",
  completed: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-amber-50 text-amber-800",
  open: "bg-ink/5 text-ink/55",
  ahead: "bg-cyan-soft text-teal",
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

function countTodayProgress(plan: LearningStudyPlan): { done: number; total: number } {
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

function DayTaskList({
  day,
  locked,
  pending,
  onToggle,
}: {
  day: LearningStudyDay;
  locked: boolean;
  pending: boolean;
  onToggle: (task: LearningStudyTask) => void;
}) {
  return (
    <ul className={cn("space-y-2", pending && "opacity-80")}>
      {day.tasks.map((task, index) => (
        <li key={`${task.id}-${index}`}>
          {locked ? (
            <div
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border border-border-soft bg-ink/[0.02] px-4 py-3 text-left border-l-4 opacity-70",
                MODULE_COLORS[task.module] ?? "border-l-cyan",
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded border border-border-soft text-ink/35">
                <Lock className="size-3" strokeWidth={2.5} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy">{task.title}</p>
                <p className="text-xs text-muted">
                  {MODULE_LABEL[task.module] ?? task.module}
                  {" · "}
                  {task.subtitle || `~${task.duration_min} min`}
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(task)}
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
          )}
        </li>
      ))}
    </ul>
  );
}

export function StudyPlanExperience({ profile }: Props) {
  const [plan, setPlan] = useState<LearningStudyPlan>(profile.study_plan);
  const [weekId, setWeekId] = useState(plan.weeks[0]?.id ?? "w1");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const today = todayIso();
  const examDate = profile.exam_date ?? profile.study_plan.exam_date ?? null;
  const activeWeek = plan.weeks.find((w) => w.id === weekId) ?? plan.weeks[0];
  const progress = useMemo(() => countTodayProgress(plan), [plan]);
  const missedDays = useMemo(
    () => countMissedDays(plan.weeks, today, examDate),
    [plan.weeks, today, examDate],
  );

  const visibleDays = useMemo(() => {
    return (activeWeek?.days ?? []).filter(
      (day) => !isDayAfterExam(day.date, examDate),
    );
  }, [activeWeek, examDate]);

  const selectedDay = useMemo(() => {
    if (selectedDate) {
      for (const week of plan.weeks) {
        const found = week.days.find((d) => d.date === selectedDate);
        if (found) return found;
      }
    }
    return visibleDays.find((d) => d.date === today) ?? visibleDays[0] ?? null;
  }, [plan.weeks, selectedDate, today, visibleDays]);

  function toggleTask(task: LearningStudyTask) {
    const nextStatus = task.status === "done" ? "pending" : "done";
    startTransition(async () => {
      try {
        const res = await patchLearningTask(task.id, nextStatus);
        setPlan(res.study_plan);
      } catch {
        /* keep prior plan */
      }
    });
  }

  const goals = profile.weekly_goals ?? [];

  return (
    <div className="space-y-8">
      <header>
        <BfSectionEyebrow>Your schedule</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Full study plan</BfSectionHeading>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Calendar className="size-4 text-cyan" />
          Adaptive plan from your evaluations
          {profile.gap_to_target != null && profile.target_band != null
            ? ` · ${profile.gap_to_target > 0 ? `${profile.gap_to_target.toFixed(1)} below` : "at"} target ${profile.target_band.toFixed(1)}`
            : null}
        </p>
      </header>

      {missedDays.length > 0 ? (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-4 sm:px-5">
          <p className="text-sm font-semibold text-amber-900">
            Catch up when you can
          </p>
          <p className="mt-1 text-sm text-amber-800/90">
            You have {missedDays.length} incomplete day
            {missedDays.length === 1 ? "" : "s"} before today. Today&apos;s plan
            stays the same — review past days separately.
          </p>
          <button
            type="button"
            onClick={() => setSelectedDate(missedDays[0].date)}
            className="mt-2 text-sm font-semibold text-cyan hover:underline"
          >
            Go to {formatDayHeader(missedDays[0].date)} →
          </button>
        </div>
      ) : null}

      <article className="rounded-2xl border border-cyan/25 bg-cyan-soft/60 p-5">
        <p className="font-mono text-[0.6875rem] tracking-[0.1em] text-cyan uppercase">
          This week&apos;s focus
        </p>
        <p className="font-display mt-2 text-base font-bold text-navy">
          {(() => {
            const raw =
              plan.weekly_focus ||
              activeWeek?.focus ||
              "Complete your first practice to personalize this plan.";
            const stripped = raw.replace(/^Focus:\s*/i, "").trim();
            const skillMatch = /^(Listening|Reading|Writing|Speaking)(?:\s*&\s*(Listening|Reading|Writing|Speaking))?$/i.exec(
              stripped,
            );
            if (skillMatch) {
              return skillMatch[2]
                ? `Prioritise ${skillMatch[1]} & ${skillMatch[2]}`
                : `Strengthen ${skillMatch[1]}`;
            }
            return stripped;
          })()}
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
                className="flex items-start gap-3 rounded-xl border border-border-soft bg-white px-4 py-3 text-sm text-navy"
              >
                <span
                  className={
                    g.done
                      ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border border-teal bg-teal text-white"
                      : "mt-0.5 size-5 shrink-0 rounded border border-border-soft bg-white"
                  }
                  aria-hidden
                >
                  {g.done ? "✓" : null}
                </span>
                <span className={g.done ? "text-muted line-through" : undefined}>
                  {g.title}
                </span>
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
        <nav className="flex gap-6 overflow-x-auto border-b border-border-soft">
          {plan.weeks.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                setWeekId(w.id);
                setSelectedDate(null);
              }}
              className={cn(
                "shrink-0 pb-3 text-sm font-semibold transition-colors",
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

      <div className="flex flex-wrap gap-2">
        {visibleDays.map((day) => {
          const status = dayStatus(day, today, examDate, plan.weeks);
          const selected = selectedDay?.date === day.date;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition-colors",
                selected
                  ? "border-cyan bg-cyan/5"
                  : "border-border-soft bg-white hover:border-cyan/30",
              )}
            >
              <p className="text-xs font-semibold text-navy">
                {formatDayHeader(day.date)}
              </p>
              <span
                className={cn(
                  "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  STATUS_CHIP[status],
                )}
              >
                {dayStatusLabel(status)}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDay ? (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <p className="font-display font-bold text-navy">
              {formatDayHeader(selectedDay.date)}
            </p>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold",
                STATUS_CHIP[dayStatus(selectedDay, today, examDate, plan.weeks)],
              )}
            >
              {dayStatusLabel(
                dayStatus(selectedDay, today, examDate, plan.weeks),
              )}
            </span>
          </div>
          <DayTaskList
            day={selectedDay}
            locked={
              !isDayAccessible(selectedDay.date, today, examDate, plan.weeks)
            }
            pending={pending}
            onToggle={toggleTask}
          />
        </section>
      ) : null}

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
                <Link
                  href={rec.href}
                  className="text-sm font-semibold text-navy hover:text-cyan"
                >
                  {rec.title}
                </Link>
                <p className="mt-1 text-xs text-muted">{rec.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
