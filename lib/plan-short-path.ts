import type { PracticeSkill } from "@/lib/practice-types";
import { sha256 } from "@/lib/plan-short-hash";

export type PlanShortTaskKind = "watch" | "practice" | "submit";

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const CODE_RE = /^[0-9A-Za-z]{8,12}$/;

/** One-letter skill codes — legacy UUID short paths only. */
export type PlanShortSkillCode = "l" | "r" | "w" | "s";

const SKILL_TO_CODE: Record<PracticeSkill, PlanShortSkillCode> = {
  listening: "l",
  reading: "r",
  writing: "w",
  speaking: "s",
};

const CODE_TO_SKILL: Record<PlanShortSkillCode, PracticeSkill> = {
  l: "listening",
  r: "reading",
  w: "writing",
  s: "speaking",
};

export function planSkillToShortCode(skill: PracticeSkill): PlanShortSkillCode {
  return SKILL_TO_CODE[skill];
}

export function parsePlanShortSkillCode(
  code: string | null | undefined,
): PracticeSkill | null {
  if (!code) return null;
  const key = code.trim().toLowerCase();
  if (key === "l" || key === "r" || key === "w" || key === "s") {
    return CODE_TO_SKILL[key];
  }
  return null;
}

export function isPlanShortTaskKind(
  value: string | null | undefined,
): value is PlanShortTaskKind {
  return value === "watch" || value === "practice" || value === "submit";
}

export function isOpaquePlanShortCode(
  value: string | null | undefined,
): boolean {
  if (!value) return false;
  return CODE_RE.test(value.trim());
}

function base62Encode(data: Uint8Array): string {
  let n = BigInt(0);
  for (const b of data) {
    n = (n << BigInt(8)) + BigInt(b);
  }
  if (n === BigInt(0)) return ALPHABET[0];
  let out = "";
  const sixtyTwo = BigInt(62);
  while (n > BigInt(0)) {
    const r = Number(n % sixtyTwo);
    out = ALPHABET[r] + out;
    n /= sixtyTwo;
  }
  return out;
}

/**
 * Deterministic 8-char code — must match backend
 * `app.practice.plan_short_links.plan_short_code`.
 */
export function planShortCode(opts: {
  skill: PracticeSkill;
  hubId: string;
  task: PlanShortTaskKind;
  taskId: string;
}): string | null {
  const hubId = opts.hubId.trim();
  const taskId = opts.taskId.trim();
  if (!hubId || !taskId) return null;
  const raw = `${opts.skill}|${hubId}|${opts.task}|${taskId}`;
  const digest = sha256(raw).slice(0, 6);
  const encoded = base62Encode(digest);
  return (encoded + "00000000").slice(0, 8);
}

/**
 * Opaque plan entry URL (no hub UUID / taskId in the path).
 * Example: `/p/xK9mQ2ab`
 */
export function planShortPath(opts: {
  skill: PracticeSkill;
  hubId: string;
  task: PlanShortTaskKind;
  taskId: string;
}): string {
  const code = planShortCode(opts);
  if (!code) {
    // Should not happen when taskId is present; keep a safe relative fallback.
    return "/study-plan/today";
  }
  return `/p/${code}`;
}

/** Legacy multi-segment path before opaque codes. */
export function legacyPlanShortPath(opts: {
  skill: PracticeSkill;
  hubId: string;
  task: PlanShortTaskKind;
  taskId: string;
}): string {
  const letter = planSkillToShortCode(opts.skill);
  return `/p/${letter}/${opts.hubId.trim()}/${opts.task}/${opts.taskId.trim()}`;
}
