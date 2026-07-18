import type { LearningStudyDay, LearningStudyWeek } from "@/lib/learning-types";

export type DayAccessStatus =
  | "locked"
  | "today"
  | "completed"
  | "in_progress"
  | "open";

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isDayAccessible(
  date: string,
  today: string,
  examDate: string | null | undefined,
): boolean {
  if (date > today) return false;
  if (examDate && date > examDate) return false;
  return true;
}

export function isDayAfterExam(
  date: string,
  examDate: string | null | undefined,
): boolean {
  return Boolean(examDate && date > examDate);
}

function countableTasks(day: LearningStudyDay) {
  return day.tasks.filter((t) => t.status !== "skipped");
}

export function dayStatus(
  day: LearningStudyDay,
  today: string,
  examDate?: string | null,
): DayAccessStatus {
  if (isDayAfterExam(day.date, examDate)) return "locked";
  if (!isDayAccessible(day.date, today, examDate)) return "locked";
  if (day.date === today) {
    const tasks = countableTasks(day);
    if (tasks.length > 0 && tasks.every((t) => t.status === "done")) {
      return "completed";
    }
    if (tasks.some((t) => t.status === "done")) return "in_progress";
    return "today";
  }

  const tasks = countableTasks(day);
  if (tasks.length === 0) return "open";
  if (tasks.every((t) => t.status === "done")) return "completed";
  if (tasks.some((t) => t.status === "done")) return "in_progress";
  return "open";
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
      if (!isDayAccessible(day.date, today, examDate)) continue;
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
    default:
      return "Open";
  }
}
