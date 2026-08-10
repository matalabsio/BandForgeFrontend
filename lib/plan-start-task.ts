import type { LearningStudyTask } from "@/lib/learning-types";
import { resolveTodayTaskHref } from "@/lib/plan-task-flow";

const MODULE_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export type DashboardStartNow = {
  href: string;
  title: string;
  meta: string;
  ctaLabel: string;
};

export function isPlanTaskUnavailable(task: LearningStudyTask): boolean {
  return (
    !task.hub_id ||
    (typeof task.href === "string" && task.href.includes("unavailable=1"))
  );
}

export function planTaskOpenHref(task: LearningStudyTask): string {
  return resolveTodayTaskHref({
    skill: task.module,
    hubId: task.hub_id,
    taskType: task.task_type,
    taskId: task.id,
    fallbackHref: task.href,
  });
}

/** Prefer practice/submit over watch so users jump into a test, not content. */
export function findNextStartTask(
  tasks: LearningStudyTask[],
): LearningStudyTask | null {
  const pending = tasks.filter(
    (t) => t.status !== "skipped" && t.status !== "done" && !isPlanTaskUnavailable(t),
  );
  if (pending.length === 0) return null;
  const ranked = [...pending].sort((a, b) => {
    const rank = (t: LearningStudyTask) =>
      t.task_type === "practice" ? 0 : t.task_type === "submit" ? 1 : 2;
    return rank(a) - rank(b);
  });
  return ranked[0] ?? null;
}

export function buildDashboardStartNow(
  tasks: LearningStudyTask[],
): DashboardStartNow | null {
  const task = findNextStartTask(tasks);
  if (!task) return null;

  const skill = MODULE_LABEL[task.module] ?? task.module;
  const mins =
    task.duration_min != null ? ` · ~${task.duration_min} min` : "";

  return {
    href: planTaskOpenHref(task),
    title:
      task.task_type === "practice"
        ? "Jump into today’s practice"
        : task.task_type === "submit"
          ? "Finish today’s submit task"
          : task.title,
    meta: `${skill}${mins} · Starts the test now`,
    ctaLabel: "Begin Practice",
  };
}
