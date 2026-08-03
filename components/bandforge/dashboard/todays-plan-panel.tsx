"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import { DailyImprovementsPanel } from "@/components/bandforge/plan/daily-improvements-panel";
import { patchLearningTask } from "@/lib/learning-api";
import type {
  LearningStudyTask,
  SkillHubProgress,
} from "@/lib/learning-types";
import { resolveTodayTaskHref } from "@/lib/plan-task-flow";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

const moduleIcons: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

const MODULE_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

const TASK_TYPE_ORDER: Record<string, number> = {
  watch: 0,
  practice: 1,
  submit: 2,
};

type TaskRow = LearningStudyTask & { clientKey: string };

type SkillStack = {
  skill: string;
  tasks: TaskRow[];
};

type Props = {
  initialTasks: LearningStudyTask[];
  userId: string;
  hubProgress?: Record<string, SkillHubProgress>;
  moduleSummary?: Record<
    string,
    { latest: number | null; best: number | null; n: number; gap: number | null }
  >;
  currentBand?: number | null;
  targetBand?: number | null;
  overallPlanPct?: number;
};

function withClientKeys(tasks: LearningStudyTask[]): TaskRow[] {
  return tasks.map((t, i) => ({ ...t, clientKey: `${t.id}__${i}` }));
}

/** Group by skill in first-seen (session) order; within skill: watch → practice → submit. */
function stackTasksBySkill(tasks: TaskRow[]): SkillStack[] {
  const visible = tasks.filter((t) => t.status !== "skipped");
  const order: string[] = [];
  const bySkill = new Map<string, TaskRow[]>();

  for (const task of visible) {
    const skill = task.module || "other";
    if (!bySkill.has(skill)) {
      order.push(skill);
      bySkill.set(skill, []);
    }
    bySkill.get(skill)!.push(task);
  }

  return order.map((skill) => {
    const stack = bySkill.get(skill) ?? [];
    stack.sort((a, b) => {
      const ao = TASK_TYPE_ORDER[a.task_type ?? ""] ?? 99;
      const bo = TASK_TYPE_ORDER[b.task_type ?? ""] ?? 99;
      return ao - bo;
    });
    return { skill, tasks: stack };
  });
}

function sumMinutes(tasks: LearningStudyTask[]): number {
  return tasks.reduce((acc, t) => acc + (t.duration_min ?? 0), 0);
}

function taskOpenHref(task: LearningStudyTask): string {
  return resolveTodayTaskHref({
    skill: task.module,
    hubId: task.hub_id,
    taskType: task.task_type,
    taskId: task.id,
    fallbackHref: task.href,
  });
}

function TaskGroup({
  title,
  icon: Icon,
  tasks,
  pending,
  onToggle,
}: {
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tasks: TaskRow[];
  pending: boolean;
  onToggle: (task: TaskRow) => void;
}) {
  const minutes = sumMinutes(tasks);

  if (tasks.length === 0) return null;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-navy">
          <Icon className="size-4 text-cyan" strokeWidth={2} />
          {title}
        </p>
        <span className="font-mono text-[11px] text-muted">
          ~{minutes} min
        </span>
      </div>
      <ul className={cn("space-y-2", pending && "opacity-80")}>
        {tasks.map((task) => {
          const ModuleIcon = moduleIcons[task.module] ?? BookIcon;
          const done = task.status === "done";
          const unavailable =
            !task.hub_id ||
            (typeof task.href === "string" && task.href.includes("unavailable=1"));

          return (
            <li key={task.clientKey}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border-soft bg-white px-3 py-3 sm:px-4",
                  done && "opacity-75",
                  unavailable && "opacity-70",
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggle(task)}
                  aria-label={done ? "Mark pending" : "Mark done"}
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                    done
                      ? "border-cyan bg-cyan text-white"
                      : "border-border-soft hover:border-cyan/50",
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : null}
                </button>
                {unavailable ? (
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-soft text-cyan">
                      <ModuleIcon className="size-[18px]" strokeWidth={2} />
                    </span>
                    <span className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted">
                        {MODULE_LABEL[task.module] ?? task.module}
                        {" · "}
                        Practice set not available yet
                      </p>
                    </span>
                  </span>
                ) : (
                  <Link
                    href={taskOpenHref(task)}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-soft text-cyan">
                      <ModuleIcon className="size-[18px]" strokeWidth={2} />
                    </span>
                    <span className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted">
                        {task.subtitle || `~${task.duration_min} min`}
                      </p>
                    </span>
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TodaysPlanPanel({
  initialTasks,
  userId: _userId,
  hubProgress,
  moduleSummary,
  currentBand = null,
  targetBand = null,
  overallPlanPct = 0,
}: Props) {
  const [tasks, setTasks] = useState(() => withClientKeys(initialTasks));
  const [pending, startTransition] = useTransition();

  const stacks = useMemo(() => stackTasksBySkill(tasks), [tasks]);

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
    .format(new Date())
    .replace(",", " ·");

  function toggleTask(task: TaskRow) {
    const nextStatus = task.status === "done" ? "pending" : "done";
    setTasks((prev) =>
      prev.map((t) =>
        t.clientKey === task.clientKey ? { ...t, status: nextStatus } : t,
      ),
    );
    startTransition(async () => {
      try {
        await patchLearningTask(task.id, nextStatus);
      } catch {
        setTasks((prev) =>
          prev.map((t) =>
            t.clientKey === task.clientKey ? { ...t, status: task.status } : t,
          ),
        );
      }
    });
  }

  const hasTasks = stacks.some((s) => s.tasks.length > 0);
  const actionable = tasks.filter((t) => t.status !== "skipped");
  const allDone =
    actionable.length > 0 &&
    actionable.every((t) => t.status === "done");

  return (
    <div className="space-y-6">
      {allDone ? (
        <DailyImprovementsPanel
          tasks={tasks}
          hubProgress={hubProgress}
          moduleSummary={moduleSummary}
          currentBand={currentBand}
          targetBand={targetBand}
          overallPlanPct={overallPlanPct}
        />
      ) : null}

      <section className="bf-dash-enter">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-mono text-xs tracking-[0.1em] text-muted-light uppercase">
            Today&apos;s plan
          </span>
          <span className="font-mono text-xs text-cyan">{dateLabel}</span>
        </div>

        {!hasTasks ? (
          <p className="rounded-[0.9375rem] border border-border-soft bg-white px-5 py-4 text-sm text-muted">
            No tasks scheduled for today.{" "}
            <Link
              href="/study-plan"
              className="font-semibold text-cyan hover:underline"
            >
              View full study plan
            </Link>
          </p>
        ) : (
          <div className="space-y-5 rounded-2xl border border-border-soft bg-white p-4 sm:p-5">
            <p className="text-xs text-muted">
              {allDone
                ? "All set for today — checklist below for reference."
                : `Suggested order — do each skill’s Watch, then Practice${
                    stacks.some((s) =>
                      s.tasks.some((t) => t.task_type === "submit"),
                    )
                      ? ", then Submit"
                      : ""
                  }.`}
            </p>
            {stacks.map((stack) => {
              const Icon = moduleIcons[stack.skill] ?? BookIcon;
              return (
                <TaskGroup
                  key={stack.skill}
                  title={MODULE_LABEL[stack.skill] ?? stack.skill}
                  icon={Icon}
                  tasks={stack.tasks}
                  pending={pending}
                  onToggle={toggleTask}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
