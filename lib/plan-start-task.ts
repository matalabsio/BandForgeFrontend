import type { LearningStudyTask } from "@/lib/learning-types";
import { planShortPath } from "@/lib/plan-short-path";
import { resolveTodayTaskHref } from "@/lib/plan-task-flow";
import { isPracticeSkill } from "@/lib/practice-types";

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

/** True when every non-skipped, non-watch today task is done (and at least one exists). */
export function isTodayPlanComplete(
  tasks: Array<{ status: string; task_type?: string }> | null | undefined,
): boolean {
  if (!tasks?.length) return false;
  const actionable = tasks.filter(
    (t) => t.status !== "skipped" && t.task_type !== "watch",
  );
  return (
    actionable.length > 0 && actionable.every((t) => t.status === "done")
  );
}

function opaquePlanHrefFromTask(task: LearningStudyTask): string | null {
  const skill = task.module;
  const hubId = task.hub_id?.trim();
  const taskId = task.id?.trim();
  if (!hubId || !taskId || !isPracticeSkill(skill)) return null;
  const rawType = task.task_type;
  const taskType =
    rawType === "watch" || rawType === "practice" || rawType === "submit"
      ? rawType === "watch"
        ? "practice"
        : rawType
      : "practice";
  const id =
    rawType === "watch" && taskId.includes("-watch-")
      ? taskId.replace("-watch-", "-practice-")
      : taskId;
  return planShortPath({
    skill,
    hubId,
    task: taskType,
    taskId: id,
  });
}

export function planTaskOpenHref(task: LearningStudyTask): string {
  const existing = typeof task.href === "string" ? task.href.trim() : "";
  const recomputed = opaquePlanHrefFromTask(task);

  // After hub rematerialize, a stale /p/{oldCode} on the task must not win
  // over the code derived from the current hub_id.
  if (
    recomputed &&
    existing &&
    /^\/p\/[0-9A-Za-z]{8,12}$/.test(existing) &&
    existing !== recomputed
  ) {
    return recomputed;
  }

  // Prefer API-minted opaque codes or working long destinations.
  if (existing && /^\/p\/[0-9A-Za-z]{8,12}$/.test(existing)) {
    return existing;
  }
  if (recomputed) {
    return recomputed;
  }
  if (
    existing &&
    (existing.includes("/practice/") || existing.includes("/test/")) &&
    !existing.includes("unavailable=1")
  ) {
    return existing;
  }
  // Legacy multi-segment /p/l|r|w|s/... — bridge page ensures + redirects.
  if (existing && /^\/p\/[lrws]\//.test(existing)) {
    return existing;
  }
  return resolveTodayTaskHref({
    skill: task.module,
    hubId: task.hub_id,
    taskType: task.task_type,
    taskId: task.id,
    fallbackHref: task.href,
  });
}

/** Prefer practice/submit; skip watch entirely (no video step in FSP plans). */
export function findNextStartTask(
  tasks: LearningStudyTask[],
): LearningStudyTask | null {
  const pending = tasks.filter(
    (t) =>
      t.status !== "skipped" &&
      t.status !== "done" &&
      t.task_type !== "watch" &&
      !isPlanTaskUnavailable(t),
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
