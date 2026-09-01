import type { MagicBentoWeekBar } from "@/components/bandforge/dashboard/magic-bento-types";
import type {
  LearningStudyPlan,
  LearningStudyTask,
  WeeklyHubCompletion,
} from "@/lib/learning-types";
import { mergePlanDayStatusesIntoTasks } from "@/lib/plan-day-tasks";

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"] as const;
const SKILL_LABEL: Record<(typeof SKILL_ORDER)[number], string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};
const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export type WeeklyFocusHeadline = {
  headline: string;
  support: string;
  skillKeys: string[];
};

/** Server-safe local calendar date. */
export function localIsoToday(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function presentWeeklyFocusHeadline(
  weeklyFocus: string | null | undefined,
  skillDifficulty: Record<string, string> | null | undefined,
): WeeklyFocusHeadline {
  if (!weeklyFocus?.trim()) {
    return {
      headline: "Stay consistent",
      support: "Your weekly focus unlocks after plan setup.",
      skillKeys: [],
    };
  }

  const raw = weeklyFocus.trim().replace(/^Focus:\s*/i, "").trim();
  const skillKeys = SKILL_ORDER.filter((key) => {
    const label = SKILL_LABEL[key];
    return new RegExp(`\\b${label}\\b`, "i").test(raw);
  });

  const bareSkillList =
    skillKeys.length > 0 &&
    raw
      .replace(/\s*&\s*/g, " ")
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .every((token) =>
        SKILL_ORDER.some(
          (k) => SKILL_LABEL[k].toLowerCase() === token.toLowerCase(),
        ),
      );

  let headline = raw;
  if (skillKeys.length === 1) {
    headline = SKILL_LABEL[skillKeys[0]];
  } else if (bareSkillList) {
    headline = skillKeys.map((k) => SKILL_LABEL[k]).join(" & ");
  }

  const hardFocus = skillKeys.filter((k) => skillDifficulty?.[k] === "hard");
  let support = "Today's work is built around this focus.";
  if (hardFocus.length === 1 && skillKeys.length === 1) {
    support = "Highest priority this week.";
  } else if (hardFocus.length > 0) {
    support = `${hardFocus.map((k) => SKILL_LABEL[k]).join(" & ")} marked hard.`;
  } else if (skillKeys.length === 1) {
    support = "Primary focus this week.";
  }

  return { headline, support, skillKeys: [...skillKeys] };
}

function mondayWeekDates(todayIso: string): string[] {
  const d = new Date(`${todayIso}T12:00:00`);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const dd = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  });
}

function taskMatchesFocus(
  task: Pick<LearningStudyTask, "module" | "status">,
  skillFilter: Set<string> | null,
): boolean {
  if (task.status === "skipped") return false;
  if (!skillFilter) return true;
  return skillFilter.has((task.module || "").toLowerCase());
}

function mergeTasksForDay(tasks: LearningStudyTask[]): LearningStudyTask[] {
  if (tasks.length === 0) return tasks;
  return mergePlanDayStatusesIntoTasks(tasks);
}

export type WeekFocusProgress = {
  bars: MagicBentoWeekBar[];
  done: number;
  total: number;
  pct: number;
};

export function weekFocusBars(
  plan: LearningStudyPlan | null | undefined,
  focusSkillKeys: string[],
  weeklyHubCompletions: WeeklyHubCompletion[] = [],
  todayIso: string = localIsoToday(),
): WeekFocusProgress {
  const dates = mondayWeekDates(todayIso);
  const byDate = new Map<string, LearningStudyTask[]>();
  for (const week of plan?.weeks ?? []) {
    for (const day of week.days) {
      byDate.set(day.date, day.tasks ?? []);
    }
  }

  const skillFilter =
    focusSkillKeys.length > 0
      ? new Set(focusSkillKeys.map((k) => k.toLowerCase()))
      : null;

  const planDoneHubIds = new Set<string>();
  for (const week of plan?.weeks ?? []) {
    for (const day of week.days) {
      const merged = mergeTasksForDay(day.tasks ?? []);
      for (const task of merged) {
        if (!taskMatchesFocus(task, skillFilter)) continue;
        if (task.status === "done" && task.hub_id) {
          planDoneHubIds.add(task.hub_id);
        }
      }
    }
  }

  const hubCompletions = weeklyHubCompletions.filter((row) => {
    if (!skillFilter) return true;
    return skillFilter.has((row.skill || "").toLowerCase());
  });

  let planWeekDone = 0;
  let planWeekTotal = 0;
  const hubsCreditedThisWeek = new Set<string>();

  const bars: MagicBentoWeekBar[] = dates.map((date, i) => {
    const merged = mergeTasksForDay(byDate.get(date) ?? []).filter((task) =>
      taskMatchesFocus(task, skillFilter),
    );
    const planDone = merged.filter((task) => task.status === "done").length;
    const planTotal = merged.length;

    const dayHubIds = new Set<string>();
    for (const row of hubCompletions) {
      if (row.date === date && !planDoneHubIds.has(row.hub_id)) {
        dayHubIds.add(row.hub_id);
      }
    }
    const hubDone = dayHubIds.size;

    const dayDone =
      planTotal > 0 ? Math.min(planDone + hubDone, planTotal) : hubDone > 0 ? hubDone : 0;

    if (date <= todayIso) {
      planWeekDone += planDone;
      planWeekTotal += planTotal;
      for (const hubId of dayHubIds) {
        hubsCreditedThisWeek.add(hubId);
      }
    }

    let pct = 0;
    if (planTotal > 0) {
      pct = Math.min(100, Math.round((dayDone / planTotal) * 100));
    } else if (hubDone > 0) {
      pct = 100;
    }

    return {
      letter: WEEKDAY_LETTERS[i],
      pct,
      isToday: date === todayIso,
    };
  });

  let weekDone = planWeekDone + hubsCreditedThisWeek.size;
  let weekTotal = planWeekTotal > 0 ? planWeekTotal : hubsCreditedThisWeek.size;
  weekDone = weekTotal > 0 ? Math.min(weekDone, weekTotal) : weekDone;

  return {
    bars,
    done: weekDone,
    total: weekTotal,
    pct:
      weekTotal > 0
        ? Math.min(100, Math.round((weekDone / weekTotal) * 100))
        : 0,
  };
}
