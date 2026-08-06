import type {
  LearningStudyDay,
  LearningStudyTask,
  LearningStudyWeek,
} from "@/lib/learning-types";

/** Max future calendar days unlocked after the full prefix through today is done. */
export const PLAN_AHEAD_MAX_DAYS = 1;

export type DayAccessStatus =
  | "locked"
  | "today"
  | "completed"
  | "in_progress"
  | "open"
  | "ahead";

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Add N calendar days to a YYYY-MM-DD key (local noon to avoid DST edge cases). */
export function addCalendarDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localIso(d);
}

function countableTasks(day: LearningStudyDay) {
  return day.tasks.filter((t) => t.status !== "skipped");
}

/** Empty / missing day counts as complete (nothing left to do). */
export function isPlanDayFullyComplete(
  day: LearningStudyDay | null | undefined,
): boolean {
  if (!day) return true;
  const tasks = countableTasks(day);
  if (tasks.length === 0) return true;
  return tasks.every((t) => t.status === "done");
}

/** Every plan day strictly before `date` is fully complete. */
export function areAllPriorPlanDaysComplete(
  weeks: LearningStudyWeek[],
  date: string,
): boolean {
  for (const day of flattenPlanDays(weeks)) {
    if (day.date >= date) continue;
    if (!isPlanDayFullyComplete(day)) return false;
  }
  return true;
}

/**
 * Sequential day access:
 * - past / today: open (catch-up / today work), unless after exam
 * - future: only within +PLAN_AHEAD_MAX_DAYS, and only when all prior plan days
 *   (including today) are complete
 */
export function isDayAccessible(
  date: string,
  today: string,
  examDate: string | null | undefined,
  weeks?: LearningStudyWeek[],
): boolean {
  if (examDate && date > examDate) return false;
  if (date <= today) return true;

  if (date > addCalendarDays(today, PLAN_AHEAD_MAX_DAYS)) return false;
  if (!weeks) return false;

  const todayDay = findPlanDay(weeks, today);
  if (!isPlanDayFullyComplete(todayDay)) return false;
  if (!areAllPriorPlanDaysComplete(weeks, date)) return false;
  return true;
}

export function isDayAfterExam(
  date: string,
  examDate: string | null | undefined,
): boolean {
  return Boolean(examDate && date > examDate);
}

export function dayStatus(
  day: LearningStudyDay,
  today: string,
  examDate?: string | null,
  weeks?: LearningStudyWeek[],
): DayAccessStatus {
  if (isDayAfterExam(day.date, examDate)) return "locked";
  if (!isDayAccessible(day.date, today, examDate, weeks)) return "locked";
  if (day.date === today) {
    const tasks = countableTasks(day);
    if (tasks.length > 0 && tasks.every((t) => t.status === "done")) {
      return "completed";
    }
    if (tasks.some((t) => t.status === "done")) return "in_progress";
    return "today";
  }

  const tasks = countableTasks(day);
  const isAhead = day.date > today;
  if (tasks.length === 0) return isAhead ? "ahead" : "open";
  if (tasks.every((t) => t.status === "done")) return "completed";
  if (tasks.some((t) => t.status === "done")) return "in_progress";
  return isAhead ? "ahead" : "open";
}

export type MissedDay = {
  date: string;
  label: string;
  incompleteCount: number;
};

export function countMissedDays(
  weeks: LearningStudyWeek[],
  today: string,
  examDate?: string | null,
): MissedDay[] {
  const missed: MissedDay[] = [];

  for (const week of weeks) {
    for (const day of week.days) {
      if (day.date >= today) continue;
      if (!isDayAccessible(day.date, today, examDate, weeks)) continue;
      const tasks = countableTasks(day);
      if (tasks.length === 0) continue;
      const incomplete = tasks.filter((t) => t.status !== "done").length;
      if (incomplete > 0) {
        missed.push({
          date: day.date,
          label: day.label,
          incompleteCount: incomplete,
        });
      }
    }
  }

  return missed.sort((a, b) => a.date.localeCompare(b.date));
}

export function dayStatusLabel(status: DayAccessStatus): string {
  switch (status) {
    case "locked":
      return "Locked";
    case "today":
      return "Today";
    case "completed":
      return "Completed";
    case "in_progress":
      return "In progress";
    case "ahead":
      return "Ahead";
    default:
      return "Open";
  }
}

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"] as const;

const TASK_TYPE_ORDER: Record<string, number> = {
  watch: 0,
  practice: 1,
  submit: 2,
};

/** Flatten all study-plan days across weeks (sorted by date). */
export function flattenPlanDays(weeks: LearningStudyWeek[]): LearningStudyDay[] {
  const days: LearningStudyDay[] = [];
  for (const week of weeks) {
    for (const day of week.days) {
      days.push(day);
    }
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

export function findPlanDay(
  weeks: LearningStudyWeek[],
  date: string,
): LearningStudyDay | null {
  for (const week of weeks) {
    const found = week.days.find((d) => d.date === date);
    if (found) return found;
  }
  return null;
}

/** Primary skill focus + task types for a day. */
export function dayFocusSummary(day: LearningStudyDay): {
  skills: string[];
  label: string;
  detailLabel: string;
  taskCount: number;
  doneCount: number;
} {
  const tasks = countableTasks(day);
  const skillSet = new Set<string>();
  const typesBySkill = new Map<string, Set<string>>();

  for (const task of tasks) {
    const skill = (task.module || "other").toLowerCase();
    skillSet.add(skill);
    if (!typesBySkill.has(skill)) typesBySkill.set(skill, new Set());
    if (task.task_type) typesBySkill.get(skill)!.add(task.task_type);
  }

  const skills: string[] = [
    ...SKILL_ORDER.filter((s) => skillSet.has(s)),
    ...[...skillSet].filter(
      (s) => !(SKILL_ORDER as readonly string[]).includes(s),
    ),
  ];

  const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const typeLabel = (t: string) => titleCase(t);

  const skillNames = skills.map(titleCase);
  const label =
    skillNames.length === 0
      ? "Rest / catch-up"
      : skillNames.length === 1
        ? skillNames[0]
        : skillNames.length === 2
          ? `${skillNames[0]} & ${skillNames[1]}`
          : `${skillNames.slice(0, -1).join(", ")} & ${skillNames[skillNames.length - 1]}`;

  const detailParts = skills.map((skill) => {
    const types = [...(typesBySkill.get(skill) ?? [])].sort(
      (a, b) => (TASK_TYPE_ORDER[a] ?? 99) - (TASK_TYPE_ORDER[b] ?? 99),
    );
    const typeBit =
      types.length > 0 ? ` (${types.map(typeLabel).join(" + ")})` : "";
    return `${titleCase(skill)}${typeBit}`;
  });

  return {
    skills,
    label,
    detailLabel: detailParts.join(" · ") || label,
    taskCount: tasks.length,
    doneCount: tasks.filter((t) => t.status === "done").length,
  };
}

/** Sort plan tasks: Listening → Reading → Writing → Speaking, then Watch → Practice → Submit. */
export function sortPlanTasks<T extends { module?: string; task_type?: string }>(
  tasks: T[],
): T[] {
  return [...tasks].sort((a, b) => {
    const aSkill = (a.module || "").toLowerCase();
    const bSkill = (b.module || "").toLowerCase();
    const ai = (SKILL_ORDER as readonly string[]).indexOf(aSkill);
    const bi = (SKILL_ORDER as readonly string[]).indexOf(bSkill);
    const aOrder = ai === -1 ? 99 : ai;
    const bOrder = bi === -1 ? 99 : bi;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (
      (TASK_TYPE_ORDER[a.task_type ?? ""] ?? 99) -
      (TASK_TYPE_ORDER[b.task_type ?? ""] ?? 99)
    );
  });
}

export type CatchUpTarget = {
  missed: MissedDay[];
  date: string;
  task: LearningStudyTask;
};

/** Oldest incomplete past day + first incomplete task (sorted skill/type order). */
export function getOldestCatchUpTarget(
  weeks: LearningStudyWeek[],
  today: string,
  examDate?: string | null,
): CatchUpTarget | null {
  const missed = countMissedDays(weeks, today, examDate);
  if (missed.length === 0) return null;

  const date = missed[0].date;
  const day = findPlanDay(weeks, date);
  if (!day) return null;

  const incomplete = sortPlanTasks(countableTasks(day)).find(
    (t) => t.status !== "done",
  );
  if (!incomplete) return null;

  return { missed, date, task: incomplete };
}

export type AheadTarget = {
  date: string;
  task: LearningStudyTask;
};

/**
 * Nearest unlocked future day’s first incomplete task.
 * Null unless sequential prefix through today is clear and tomorrow is in plan.
 */
export function getNextAheadTarget(
  weeks: LearningStudyWeek[],
  today: string,
  examDate?: string | null,
): AheadTarget | null {
  const tomorrow = addCalendarDays(today, 1);
  if (!isDayAccessible(tomorrow, today, examDate, weeks)) return null;

  const day = findPlanDay(weeks, tomorrow);
  if (!day) return null;

  const incomplete = sortPlanTasks(countableTasks(day)).find(
    (t) => t.status !== "done",
  );
  if (!incomplete) return null;

  return { date: tomorrow, task: incomplete };
}

export type CalendarCell = {
  date: string;
  inMonth: boolean;
  day: LearningStudyDay | null;
};

/** Build a Sunday-start month grid for a given YYYY-MM month key. */
export function buildMonthCells(
  monthKey: string,
  weeks: LearningStudyWeek[],
): CalendarCell[] {
  const [yStr, mStr] = monthKey.split("-");
  const year = Number(yStr);
  const month = Number(mStr) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(month)) return [];

  const first = new Date(year, month, 1);
  const startPad = first.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const byDate = new Map(
    flattenPlanDays(weeks).map((d) => [d.date, d] as const),
  );

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startPad; i += 1) {
    const d = new Date(year, month, 1 - (startPad - i));
    const iso = localIso(d);
    cells.push({ date: iso, inMonth: false, day: byDate.get(iso) ?? null });
  }
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
    const d = new Date(year, month, dayNum);
    const iso = localIso(d);
    cells.push({ date: iso, inMonth: true, day: byDate.get(iso) ?? null });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const next = new Date(`${last.date}T12:00:00`);
    next.setDate(next.getDate() + 1);
    const iso = localIso(next);
    cells.push({ date: iso, inMonth: false, day: byDate.get(iso) ?? null });
  }
  return cells;
}

function localIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthKeyFromIso(iso: string): string {
  return iso.slice(0, 7);
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [yStr, mStr] = monthKey.split("-");
  const d = new Date(Number(yStr), Number(mStr) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
