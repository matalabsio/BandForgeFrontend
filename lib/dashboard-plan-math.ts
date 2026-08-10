import type {
  LearningStudyPlan,
  LearningProfile,
  SkillHubProgress,
} from "@/lib/learning-types";
import {
  bandGapSummary,
  type SkillBands,
} from "@/lib/diagnostic-performance";

function localIsoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function diffCalendarDays(fromIso: string, toIso: string): number | null {
  const from = new Date(`${fromIso.slice(0, 10)}T12:00:00`);
  const to = new Date(`${toIso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export type ExamTimeline = {
  examDate: string | null;
  /** Signed: negative means the exam date has passed. */
  daysRemaining: number | null;
  currentDay: number | null;
  totalDays: number | null;
};

/** Resolve exam countdown from profile fields, with date fallbacks. */
export function resolveExamTimeline(
  learning: Pick<
    LearningProfile,
    "exam_date" | "prep_start" | "total_days" | "current_day" | "days_remaining" | "study_plan"
  >,
): ExamTimeline {
  const plan = learning.study_plan;
  const examDate = learning.exam_date ?? plan?.exam_date ?? null;
  const prepStart = learning.prep_start ?? plan?.prep_start ?? null;
  const today = localIsoToday();

  let totalDays = learning.total_days ?? plan?.total_days ?? null;
  if ((totalDays == null || totalDays <= 0) && prepStart && examDate) {
    const span = diffCalendarDays(prepStart, examDate);
    if (span != null) totalDays = Math.max(1, span + 1);
  }

  let daysRemaining =
    examDate != null ? diffCalendarDays(today, examDate) : null;
  if (daysRemaining == null && learning.days_remaining != null) {
    daysRemaining = learning.days_remaining;
  }

  let currentDay = learning.current_day ?? null;
  if (currentDay == null && prepStart) {
    const elapsed = diffCalendarDays(prepStart, today);
    if (elapsed != null) currentDay = Math.max(1, elapsed + 1);
  }
  if (currentDay != null && totalDays != null) {
    currentDay = Math.min(currentDay, totalDays);
  }

  return { examDate, daysRemaining, currentDay, totalDays };
}

const SKILL_MODULES = ["listening", "reading", "writing", "speaking"] as const;

/** Full mock tests unlock only after every skill's practice plan is done. */
export function isFullPracticePlanComplete(
  hubProgress?: Record<string, SkillHubProgress> | null,
  plan?: LearningStudyPlan | null,
): boolean {
  const hasHubRows = SKILL_MODULES.some((skill) => hubProgress?.[skill]);
  if (hasHubRows) {
    return SKILL_MODULES.every((skill) => {
      const row = hubProgress?.[skill];
      if (!row) return false;
      if (row.mock_unlocked) return true;
      const required = row.required_for_mock || row.total_count;
      return required > 0 && row.completed_count >= required;
    });
  }

  let total = 0;
  let done = 0;
  for (const week of plan?.weeks ?? []) {
    for (const day of week.days) {
      for (const task of day.tasks) {
        if (!SKILL_MODULES.includes(task.module as (typeof SKILL_MODULES)[number])) {
          continue;
        }
        if (task.status === "skipped") continue;
        total += 1;
        if (task.status === "done") done += 1;
      }
    }
  }
  return total > 0 && done >= total;
}

/** Overall skill-task completion % through today (shared by dashboard + hubs). */
export function overallPlanPercent(plan: LearningStudyPlan): number {
  const today = new Date().toISOString().slice(0, 10);
  let done = 0;
  let total = 0;
  for (const week of plan.weeks) {
    for (const day of week.days) {
      if (day.date > today) continue;
      for (const task of day.tasks) {
        if (!SKILL_MODULES.includes(task.module as (typeof SKILL_MODULES)[number])) continue;
        total += 1;
        if (task.status === "done") done += 1;
      }
    }
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function moduleSummaryToBands(
  summary: LearningProfile["module_summary"] | undefined | null,
): SkillBands {
  return {
    listening: summary?.listening?.latest ?? null,
    reading: summary?.reading?.latest ?? null,
    writing: summary?.writing?.latest ?? null,
    speaking: summary?.speaking?.latest ?? null,
  };
}

export function computeBandGapFromLearning(
  learning: Pick<LearningProfile, "module_summary" | "target_band">,
) {
  const targetBand = learning.target_band ?? 7;
  const bands = moduleSummaryToBands(learning.module_summary);
  return { targetBand, bands, ...bandGapSummary(bands, targetBand) };
}
