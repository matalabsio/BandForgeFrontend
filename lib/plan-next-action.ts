/**
 * Done-day primary CTA: catch-up → tomorrow → Full plan.
 * Never falls back to hub practice routes when a study plan exists.
 */

import type { LearningStudyTask, LearningStudyWeek } from "@/lib/learning-types";
import { planTaskOpenHref } from "@/lib/plan-start-task";
import {
  countMissedDays,
  findPlanDay,
  getNextAheadTarget,
  getOldestCatchUpTarget,
  studyPlanDayHref,
  weeksWithDayMarkedDone,
  type AheadTarget,
  type CatchUpTarget,
} from "@/lib/study-plan-calendar";

export type DoneDayActionKind = "catch_up" | "tomorrow" | "full_plan";

export type DoneDayPrimaryAction = {
  kind: DoneDayActionKind;
  href: string;
  label: string;
  hint?: string;
  /** Study-plan day to cache when navigating (catch-up / tomorrow). */
  planDate?: string;
  task?: LearningStudyTask;
  /** True when catch-up is the primary CTA (for secondary catch-up UI). */
  catchUpIsPrimary: boolean;
  /** Missed-day count for Completed-card secondary affordances. */
  missedDayCount: number;
  catchUp: CatchUpTarget | null;
  ahead: AheadTarget | null;
};

export type ResolveDoneDayPrimaryActionOpts = {
  weeks: LearningStudyWeek[];
  today: string;
  examDate?: string | null;
  /**
   * When true, treat `today` as fully done for ahead unlock even if profile
   * weeks still show the last task pending (client just finished).
   */
  markTodayDoneForAhead?: boolean;
};

export function resolveDoneDayPrimaryAction(
  opts: ResolveDoneDayPrimaryActionOpts,
): DoneDayPrimaryAction {
  const { weeks, today, examDate } = opts;
  const missed = weeks.length
    ? countMissedDays(weeks, today, examDate)
    : [];
  const missedDayCount = missed.length;

  const catchUp =
    weeks.length > 0
      ? getOldestCatchUpTarget(weeks, today, examDate)
      : null;

  if (catchUp?.task) {
    return {
      kind: "catch_up",
      href: planTaskOpenHref(catchUp.task),
      label:
        missedDayCount === 1
          ? "Catch up on previous day"
          : `Catch up on ${missedDayCount} previous days`,
      hint: "Finish previous plan days before unlocking tomorrow.",
      planDate: catchUp.date,
      task: catchUp.task,
      catchUpIsPrimary: true,
      missedDayCount,
      catchUp,
      ahead: null,
    };
  }

  // Missed days exist but every incomplete task is unavailable — send to Full plan.
  if (missedDayCount > 0) {
    const oldest = missed[0];
    return {
      kind: "full_plan",
      href: studyPlanDayHref(oldest.date, { unavailable: true }),
      label: "View full plan",
      hint:
        missedDayCount === 1
          ? "A previous day still needs content — open Full plan to review it."
          : `${missedDayCount} previous days still need content — open Full plan.`,
      planDate: oldest.date,
      catchUpIsPrimary: false,
      missedDayCount,
      catchUp: null,
      ahead: null,
    };
  }

  const weeksForAhead =
    opts.markTodayDoneForAhead && weeks.length
      ? weeksWithDayMarkedDone(weeks, today)
      : weeks;

  const ahead =
    weeksForAhead.length > 0
      ? getNextAheadTarget(weeksForAhead, today, examDate)
      : null;

  if (ahead?.task) {
    return {
      kind: "tomorrow",
      href: planTaskOpenHref(ahead.task),
      label: "Start tomorrow's plan",
      hint: "You're clear through today — practice tomorrow early to advance hubs toward your full mock.",
      planDate: ahead.date,
      task: ahead.task,
      catchUpIsPrimary: false,
      missedDayCount: 0,
      catchUp: null,
      ahead,
    };
  }

  return {
    kind: "full_plan",
    href: "/study-plan",
    label: "View full plan",
    hint: undefined,
    catchUpIsPrimary: false,
    missedDayCount: 0,
    catchUp: null,
    ahead: null,
  };
}

/** Cache helper for callers that navigate from a DoneDayPrimaryAction. */
export function planDayTasksForAction(
  weeks: LearningStudyWeek[],
  action: DoneDayPrimaryAction,
): LearningStudyTask[] | null {
  if (!action.planDate) return null;
  const day = findPlanDay(weeks, action.planDate);
  return day?.tasks?.length ? day.tasks : null;
}
