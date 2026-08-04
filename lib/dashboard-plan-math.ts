import type { LearningStudyPlan, LearningProfile } from "@/lib/learning-types";
import {
  bandGapSummary,
  type SkillBands,
} from "@/lib/diagnostic-performance";

/** Overall skill-task completion % through today (shared by dashboard + hubs). */
export function overallPlanPercent(plan: LearningStudyPlan): number {
  const skillModules = ["listening", "reading", "writing", "speaking"];
  const today = new Date().toISOString().slice(0, 10);
  let done = 0;
  let total = 0;
  for (const week of plan.weeks) {
    for (const day of week.days) {
      if (day.date > today) continue;
      for (const task of day.tasks) {
        if (!skillModules.includes(task.module)) continue;
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
