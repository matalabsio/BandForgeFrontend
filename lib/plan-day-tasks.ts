/**
 * Client cache of today's plan tasks for day-level next/prev without
 * fetching the learning profile mid-exam.
 */

import {
  resolveTodayTaskHref,
  type PlanTaskKind,
} from "@/lib/plan-task-flow";
import type { PracticeSkill } from "@/lib/practice-types";

export type PlanDayTaskCacheRow = {
  id: string;
  module: string;
  task_type?: "watch" | "practice" | "submit" | null;
  hub_id?: string | null;
  href?: string | null;
  status: "pending" | "done" | "skipped";
};

export type PlanResultContext = {
  task?: string | null;
  taskId?: string | null;
  hubId?: string | null;
};

const STORAGE_KEY = "bf-plan-day-tasks";

/** Fired after sessionStorage plan-day task cache writes (client only). */
export const PLAN_DAY_TASKS_UPDATED_EVENT = "bf:plan-day-tasks-updated";

function notifyPlanDayTasksUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PLAN_DAY_TASKS_UPDATED_EVENT));
}

type DayBucket = {
  date: string;
  tasks: PlanDayTaskCacheRow[];
};

const MODULE_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

const TASK_LABEL: Record<string, string> = {
  watch: "Watch",
  practice: "practice",
  submit: "Submit",
};

/** Real practice skills only — grammar/vocab have no question bank. */
function isContinueEligibleTask(row: PlanDayTaskCacheRow): boolean {
  if (!isPlanPracticeSkill(row.module)) return false;
  const href = (row.href ?? "").trim();
  if (href.includes("/content-library")) return false;
  return true;
}

/** Local calendar day — keep inline to avoid import cycles with plan-step-completion. */
function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function emptyBucket(): DayBucket {
  return { date: localDateKey(), tasks: [] };
}

function readBucket(): DayBucket {
  if (typeof window === "undefined") return emptyBucket();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyBucket();
    const parsed = JSON.parse(raw) as DayBucket;
    if (
      !parsed ||
      parsed.date !== localDateKey() ||
      !Array.isArray(parsed.tasks)
    ) {
      return emptyBucket();
    }
    return parsed;
  } catch {
    return emptyBucket();
  }
}

function writeBucket(bucket: DayBucket): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bucket));
    notifyPlanDayTasksUpdated();
  } catch {
    /* ignore quota */
  }
}

export function cachePlanDayTasks(
  tasks: Array<{
    id: string;
    module: string;
    task_type?: "watch" | "practice" | "submit" | null;
    hub_id?: string | null;
    href?: string | null;
    status: "pending" | "done" | "skipped";
  }>,
): void {
  writeBucket({
    date: localDateKey(),
    tasks: tasks.map((t) => ({
      id: t.id,
      module: t.module,
      task_type: t.task_type ?? null,
      hub_id: t.hub_id ?? null,
      href: t.href ?? null,
      status: t.status,
    })),
  });
}

export function readPlanDayTasks(): PlanDayTaskCacheRow[] {
  return readBucket().tasks;
}

export function markCachedPlanTaskDone(taskId: string | null | undefined): void {
  if (!taskId) return;
  const bucket = readBucket();
  let changed = false;
  const tasks = bucket.tasks.map((t) => {
    if (t.id !== taskId || t.status === "done") return t;
    changed = true;
    return { ...t, status: "done" as const };
  });
  if (changed) writeBucket({ ...bucket, tasks });
}

/** Mark every cached practice/submit row for a hub done (avoids same-hub Continue loops). */
export function markCachedPlanHubTasksDone(
  hubId: string | null | undefined,
): void {
  if (!hubId) return;
  const bucket = readBucket();
  let changed = false;
  const tasks = bucket.tasks.map((t) => {
    if (t.hub_id !== hubId || t.status === "done" || t.status === "skipped") {
      return t;
    }
    if (t.task_type !== "practice" && t.task_type !== "submit") return t;
    changed = true;
    return { ...t, status: "done" as const };
  });
  if (changed) writeBucket({ ...bucket, tasks });
}

type MergeableTaskStatus = "pending" | "done" | "skipped";

function taskFingerprint(row: {
  id?: string;
  module?: string | null;
  task_type?: string | null;
  hub_id?: string | null;
}): string {
  if (row.hub_id && row.module && row.task_type) {
    return `${row.module}|${row.task_type}|${row.hub_id}`;
  }
  return row.id ?? "";
}

/**
 * Overlay sessionStorage plan-day statuses onto server tasks.
 * Prefer `done` when either side says done — never downgrade done→pending
 * from a stale RSC payload after fire-and-forget task patches.
 * Matches by task id first, then module+task_type+hub_id (ID churn resilient).
 */
export function mergePlanDayStatusesIntoTasks<
  T extends {
    id: string;
    status: MergeableTaskStatus;
    module?: string | null;
    task_type?: string | null;
    hub_id?: string | null;
  },
>(tasks: T[]): T[] {
  const cached = readPlanDayTasks();
  if (cached.length === 0 || tasks.length === 0) return tasks;

  const byId = new Map(cached.map((row) => [row.id, row.status]));
  const byFp = new Map<string, MergeableTaskStatus>();
  for (const row of cached) {
    if (row.status !== "done") continue;
    const fp = taskFingerprint(row);
    if (fp) byFp.set(fp, "done");
  }

  let changed = false;
  const next = tasks.map((task) => {
    if (task.status === "done" || task.status === "skipped") return task;
    const cachedStatus =
      byId.get(task.id) ?? byFp.get(taskFingerprint(task));
    if (cachedStatus !== "done") return task;
    changed = true;
    return { ...task, status: "done" as const };
  });
  return changed ? next : tasks;
}

/** True when two task lists differ only by per-id status (same length + ids). */
export function planTaskStatusesDiffer(
  a: Array<{ id: string; status: string }>,
  b: Array<{ id: string; status: string }>,
): boolean {
  if (a.length !== b.length) return true;
  const bById = new Map(b.map((t) => [t.id, t.status]));
  for (const task of a) {
    if (bById.get(task.id) !== task.status) return true;
  }
  return false;
}

function actionableTasks(): PlanDayTaskCacheRow[] {
  return readPlanDayTasks().filter(
    (t) => t.status !== "skipped" && isContinueEligibleTask(t),
  );
}

export function adjacentPlanDayTask(
  taskId: string | null | undefined,
  dir: "next" | "prev",
): PlanDayTaskCacheRow | null {
  if (!taskId) return null;
  const tasks = actionableTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return null;
  const nextIdx = dir === "next" ? idx + 1 : idx - 1;
  return tasks[nextIdx] ?? null;
}

/** First unfinished task to continue after the current one. */
export function nextPendingPlanDayTask(
  currentTaskId: string | null | undefined,
  opts?: { preferExercise?: boolean; skipHubId?: string | null },
): PlanDayTaskCacheRow | null {
  const preferExercise = opts?.preferExercise !== false;
  const skipHubId = opts?.skipHubId ?? null;
  const tasks = actionableTasks();
  if (tasks.length === 0) return null;

  const current = currentTaskId
    ? tasks.find((t) => t.id === currentTaskId)
    : undefined;
  const blockedHub = skipHubId || current?.hub_id || null;

  const isOpen = (row: PlanDayTaskCacheRow) => {
    if (row.status === "done") return false;
    if (row.id === currentTaskId) return false;
    // Don't re-open the hub the user just finished under another task id.
    if (
      blockedHub &&
      row.hub_id === blockedHub &&
      (row.task_type === "practice" || row.task_type === "submit")
    ) {
      return false;
    }
    return true;
  };

  const idx = currentTaskId
    ? tasks.findIndex((t) => t.id === currentTaskId)
    : -1;

  // Prefer tasks after the one just finished; otherwise any remaining open task.
  const after = (idx >= 0 ? tasks.slice(idx + 1) : tasks).filter(isOpen);
  const pool = after.length > 0 ? after : tasks.filter(isOpen);
  if (pool.length === 0) return null;

  // Match Today banner: Practice/Submit before Watch.
  if (preferExercise) {
    const exercise = pool.find(
      (t) => t.task_type === "practice" || t.task_type === "submit",
    );
    if (exercise) return exercise;
  }

  return pool[0] ?? null;
}

/**
 * Refresh day-task cache from learning today/profile.
 * Always prefer a network refresh on results so Continue sees real pending work.
 * Marks current task (+ same-hub practice siblings) done locally so Continue skips
 * them even when the server PATCH 404s from task-id churn.
 */
export async function ensurePlanDayTasksCached(
  currentTaskId?: string | null,
  opts?: { force?: boolean; hubId?: string | null },
): Promise<PlanDayTaskCacheRow[]> {
  if (typeof window === "undefined") return [];

  const force = opts?.force !== false;
  const existing = readPlanDayTasks();
  const hasCurrent =
    !currentTaskId || existing.some((t) => t.id === currentTaskId);

  if (force || existing.length === 0 || !hasCurrent) {
    try {
      const { getLearningProfile } = await import("@/lib/learning-api");
      const profile = await getLearningProfile();
      const incoming = profile.todays_tasks ?? [];
      if (incoming.length > 0) {
        // Preserve local done marks across id/status churn from profile refresh.
        cachePlanDayTasks(mergePlanDayStatusesIntoTasks(incoming));
      }
    } catch {
      /* keep existing cache */
    }
  }

  if (currentTaskId) markCachedPlanTaskDone(currentTaskId);
  if (opts?.hubId) markCachedPlanHubTasksDone(opts.hubId);
  return readPlanDayTasks();
}

function openHrefForRow(row: PlanDayTaskCacheRow): string {
  return resolveTodayTaskHref({
    skill: row.module,
    hubId: row.hub_id,
    taskType: row.task_type,
    taskId: row.id,
    fallbackHref: row.href,
  });
}

/** Public alias for Continue / Previous CTA hrefs. */
export function resolveTodayTaskHrefFromCache(
  row: PlanDayTaskCacheRow,
): string {
  return openHrefForRow(row);
}

export function resolvePlanContinueHref(
  currentTaskId: string | null | undefined,
): string {
  const next = nextPendingPlanDayTask(currentTaskId);
  if (!next) return "/study-plan/today";
  return openHrefForRow(next);
}

export function resolvePlanPreviousHref(
  currentTaskId: string | null | undefined,
): string {
  const prev = adjacentPlanDayTask(currentTaskId, "prev");
  if (!prev) return "/study-plan/today";
  return openHrefForRow(prev);
}

export function planTaskShortLabel(row: PlanDayTaskCacheRow): string {
  const skill = MODULE_LABEL[row.module] ?? row.module;
  const kind = row.task_type ? TASK_LABEL[row.task_type] ?? row.task_type : "";
  if (row.task_type === "practice") return `${skill} practice`;
  if (kind) return `${skill} ${kind}`;
  return skill;
}

export function planContinueLabel(
  currentTaskId: string | null | undefined,
): string {
  const next = nextPendingPlanDayTask(currentTaskId);
  if (!next) return "Back to Today's plan";
  return `Continue · ${planTaskShortLabel(next)}`;
}

export function planPreviousLabel(
  currentTaskId: string | null | undefined,
): string {
  const prev = adjacentPlanDayTask(currentTaskId, "prev");
  if (!prev) return "Back to Today's plan";
  return `Previous · ${planTaskShortLabel(prev)}`;
}

export function appendPlanResultParams(
  href: string,
  ctx: PlanResultContext | null | undefined,
): string {
  if (!ctx?.taskId && !ctx?.hubId) return href;
  const url = new URL(href, "http://localhost");
  url.searchParams.set("from", "plan");
  if (ctx.task) url.searchParams.set("task", ctx.task);
  if (ctx.taskId) url.searchParams.set("taskId", ctx.taskId);
  if (ctx.hubId) url.searchParams.set("hubId", ctx.hubId);
  return `${url.pathname}${url.search}`;
}

export function parsePlanResultSearchParams(sp: {
  from?: string | null;
  task?: string | null;
  taskId?: string | null;
  hubId?: string | null;
}): PlanResultContext | null {
  if (sp.from !== "plan") return null;
  return {
    task: sp.task ?? null,
    taskId: sp.taskId ?? null,
    hubId: sp.hubId ?? null,
  };
}

export function isPlanPracticeSkill(
  skill: string | null | undefined,
): skill is PracticeSkill {
  return (
    skill === "listening" ||
    skill === "reading" ||
    skill === "writing" ||
    skill === "speaking"
  );
}

export function coercePlanTaskKind(
  value: string | null | undefined,
): PlanTaskKind | null {
  if (value === "watch" || value === "practice" || value === "submit") {
    return value;
  }
  return null;
}
