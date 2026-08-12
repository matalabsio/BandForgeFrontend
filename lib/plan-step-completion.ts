"use client";

import {
  markCachedPlanHubTasksDone,
  markCachedPlanTaskDone,
  resolvePlanContinueHref,
} from "@/lib/plan-day-tasks";
import { patchLearningTask } from "@/lib/learning-api";
import {
  afterPlanStepHref,
  type ModuleTargetConfig,
  type PlanTaskKind,
} from "@/lib/plan-task-flow";
import { completePracticeHub } from "@/lib/practice-api";
import type { PracticeSkill } from "@/lib/practice-types";

type BuildNextHrefInput = {
  skill: PracticeSkill;
  hubId: string;
  currentTask: PlanTaskKind | null | undefined;
  currentTaskId?: string | null;
  bankNumber?: number;
  catalogNumber?: number | null;
  part?: number | null;
  submitConfig?: ModuleTargetConfig | null;
  preferExercise?: boolean;
};

type CompletePlanStepInput = BuildNextHrefInput & {
  fromPlan: boolean;
  completeHub?: boolean;
};

type MarkPlanStepInput = {
  fromPlan: boolean;
  hubId?: string | null;
  currentTaskId?: string | null;
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
  const withinSkill = afterPlanStepHref({
    skill: input.skill,
    hubId: input.hubId,
    currentTask: input.currentTask,
    currentTaskId: input.currentTaskId,
    bankNumber: input.bankNumber,
    catalogNumber: input.catalogNumber,
    part: input.part,
    submitConfig: input.submitConfig,
    preferExercise: input.preferExercise,
  });
  if (withinSkill !== "/study-plan/today") return withinSkill;
  return resolvePlanContinueHref(input.currentTaskId) || "/study-plan/today";
}

/**
 * Best-effort checklist/hub sync without navigating.
 * Used when results are shown before Continue.
 */
export function markPlanStepDone(input: MarkPlanStepInput): void {
  if (!input.fromPlan) return;
  if (input.currentTaskId) {
    markCachedPlanTaskDone(input.currentTaskId);
    void patchLearningTask(input.currentTaskId, "done").catch(() => {});
  }
  if (input.hubId) {
    // Avoid Continue re-opening the same hub under a sibling task id.
    markCachedPlanHubTasksDone(input.hubId);
  }
  if (input.completeHub && input.hubId) {
    void completePracticeHub(input.hubId).catch(() => {});
  }
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
  markPlanStepDone({
    fromPlan: true,
    hubId: input.hubId,
    currentTaskId: input.currentTaskId,
    completeHub: input.completeHub,
  });
  return buildPlanNextHref(input) || "/study-plan/today";
}
