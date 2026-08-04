"use client";

import { patchLearningTask } from "@/lib/learning-api";
import { afterPlanStepHref, type PlanTaskKind } from "@/lib/plan-task-flow";
import { completePracticeHub } from "@/lib/practice-api";
import type { PracticeSkill } from "@/lib/practice-types";

type BuildNextHrefInput = {
  skill: PracticeSkill;
  hubId: string;
  currentTask: PlanTaskKind | null | undefined;
  currentTaskId?: string | null;
  bankNumber?: number;
  preferExercise?: boolean;
};

type CompletePlanStepInput = BuildNextHrefInput & {
  fromPlan: boolean;
  completeHub?: boolean;
};

/** Local calendar day (YYYY-MM-DD) — avoids UTC midnight shifting for report keys. */
export function localPlanDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Shared skill policy for when a task completion should also complete a hub.
 * - Listening / Reading complete on Practice
 * - Writing / Speaking complete on Submit
 */
export function shouldCompleteHubForPlanTask(
  skill: PracticeSkill,
  currentTask: PlanTaskKind | null | undefined,
): boolean {
  if (skill === "listening" || skill === "reading") {
    return currentTask === "practice";
  }
  if (skill === "writing" || skill === "speaking") {
    return currentTask === "submit";
  }
  return false;
}

export function buildPlanNextHref(input: BuildNextHrefInput): string {
  return afterPlanStepHref({
    skill: input.skill,
    hubId: input.hubId,
    currentTask: input.currentTask,
    currentTaskId: input.currentTaskId,
    bankNumber: input.bankNumber,
    preferExercise: input.preferExercise,
  });
}

/**
 * Best-effort sync for checklist/hub updates, then return the next route.
 * We intentionally do not block navigation on these API calls.
 * Always returns a string when fromPlan is true (defaults to Today).
 */
export function completePlanStepAndGetNextHref(
  input: CompletePlanStepInput,
): string | null {
  if (!input.fromPlan) return null;
  if (input.currentTaskId) {
    void patchLearningTask(input.currentTaskId, "done").catch(() => {});
  }
  if (input.completeHub) {
    void completePracticeHub(input.hubId).catch(() => {});
  }
  return buildPlanNextHref(input) || "/study-plan/today";
}
