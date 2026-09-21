"use client";

import {
  markCachedPlanHubTasksDone,
  markCachedPlanTaskDone,
  resolvePlanContinueHref,
} from "@/lib/plan-day-tasks";
import { patchLearningTask } from "@/lib/learning-api";
import {
  afterPlanStepHref,
  swapPlanTaskId,
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
  /** When set with practice, Speaking also closes the Submit sibling (same exam). */
  skill?: PracticeSkill | null;
  currentTask?: PlanTaskKind | null;
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
 * - Writing completes on Submit (Task 2 is separate)
 * - Speaking completes on Practice (Submit is the same exam — no second run)
 */
export function shouldCompleteHubForPlanTask(
  skill: PracticeSkill,
  currentTask: PlanTaskKind | null | undefined,
): boolean {
  if (skill === "listening" || skill === "reading") {
    return currentTask === "practice";
  }
  if (skill === "speaking") {
    return currentTask === "practice" || currentTask === "submit";
  }
  if (skill === "writing") {
    return currentTask === "submit";
  }
  return false;
}

/**
 * Speaking Practice and Submit share one module exam. Finishing Practice must
 * also close Submit so Continue does not start Speaking again.
 */
export function shouldCollapseSpeakingSubmit(
  skill: PracticeSkill | null | undefined,
  currentTask: PlanTaskKind | null | undefined,
): boolean {
  return skill === "speaking" && currentTask === "practice";
}

export function buildPlanNextHref(input: BuildNextHrefInput): string {
  // After Speaking Practice, navigate as if Submit is already done.
  const effectiveTask = shouldCollapseSpeakingSubmit(
    input.skill,
    input.currentTask,
  )
    ? "submit"
    : input.currentTask;
  const effectiveTaskId =
    effectiveTask === "submit" && input.currentTask === "practice"
      ? (swapPlanTaskId(input.currentTaskId, "submit") ?? input.currentTaskId)
      : input.currentTaskId;

  const withinSkill = afterPlanStepHref({
    skill: input.skill,
    hubId: input.hubId,
    currentTask: effectiveTask,
    currentTaskId: effectiveTaskId,
    bankNumber: input.bankNumber,
    catalogNumber: input.catalogNumber,
    part: input.part,
    submitConfig: input.submitConfig,
    preferExercise: input.preferExercise,
  });
  if (withinSkill !== "/study-plan/today") return withinSkill;
  return (
    resolvePlanContinueHref(effectiveTaskId ?? input.currentTaskId) ||
    "/study-plan/today"
  );
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

  // Speaking: one exam covers Practice + Submit — close Submit so it does not
  // reopen the Speaking module.
  if (
    shouldCollapseSpeakingSubmit(input.skill, input.currentTask) &&
    input.currentTaskId
  ) {
    const submitId = swapPlanTaskId(input.currentTaskId, "submit");
    if (submitId && submitId !== input.currentTaskId) {
      markCachedPlanTaskDone(submitId);
      void patchLearningTask(submitId, "done").catch(() => {});
    }
  }

  const completeHub =
    input.completeHub ||
    shouldCollapseSpeakingSubmit(input.skill, input.currentTask);

  if (completeHub && input.hubId) {
    markCachedPlanHubTasksDone(input.hubId);
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
    skill: input.skill,
    currentTask: input.currentTask,
  });
  return buildPlanNextHref(input) || "/study-plan/today";
}
