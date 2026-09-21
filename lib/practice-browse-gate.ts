/**
 * FSP strict-plan gate: block free-browse /practice surfaces.
 * Plan deep links (`from=plan` / task / taskId) stay allowed.
 */

import { hasFullSkillProgram } from "@/lib/entitlement";
import type { Subscription } from "@/lib/payments";

/** Where FSP users land when they hit a free-browse practice URL. */
export const FSP_PRACTICE_BROWSE_REDIRECT = "/study-plan/today";

/** True when Full Skill Program users must not free-browse hub libraries. */
export function isFspPracticeBrowseRestricted(
  sub: Subscription | null | undefined,
): boolean {
  return hasFullSkillProgram(sub);
}

/**
 * Plan-driven practice session (Today / Full plan deep link).
 * Accepts `from=plan` or plan task identifiers so soft-nav variants still pass.
 */
export function hasPlanPracticeContext(input: {
  from?: string | string[] | null;
  task?: string | string[] | null;
  taskId?: string | string[] | null;
}): boolean {
  const from = firstQueryValue(input.from);
  if (from === "plan") return true;
  const task = firstQueryValue(input.task);
  if (task === "watch" || task === "practice" || task === "submit") return true;
  const taskId = firstQueryValue(input.taskId);
  return Boolean(taskId && taskId.startsWith("t-"));
}

function firstQueryValue(
  value: string | string[] | null | undefined,
): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}
