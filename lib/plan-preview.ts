import type { SkillBands, SkillKey } from "@/lib/diagnostic-performance";
import { daysUntilExam, totalPrepDays } from "@/lib/diagnostic-lead";

export const HARD_GAP_THRESHOLD = 1.0;
export const GAP_FLOOR = 0.5;
export const FOUNDATION_BAND_THRESHOLD = 6.0;
export const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";

export type SkillDifficulty = "hard" | "easy";

export type SessionPathKind = "foundation" | "mixed";

const SKILL_ORDER: SkillKey[] = ["listening", "reading", "writing", "speaking"];
const HARD_POOL: SkillKey[] = ["writing", "speaking"];
const EASY_POOL: SkillKey[] = ["listening", "reading"];
const MIXED_TEMPLATE = ["H", "E", "H", "H", "E"] as const;

export type SkillDayAllocation = Record<SkillKey, number>;
export type SkillGapMap = Record<SkillKey, number>;

export type PlanPreview = {
  targetBand: number;
  examDate: string;
  daysRemaining: number;
  totalDays: number;
  gaps: SkillGapMap;
  rawGaps: SkillGapMap;
  difficulty: Record<SkillKey, SkillDifficulty>;
  focusSkills: SkillKey[];
  focusLabel: string;
  sessionPathKind: SessionPathKind;
  sessionOrder: SkillKey[];
  sessionOrderLabels: string[];
  dayAllocation: SkillDayAllocation;
  sessionPathDescription: string;
};

export function skillGap(band: number | null | undefined, target: number): number {
  if (band == null || band <= 0) return Math.max(target, GAP_FLOOR);
  return Math.max(target - band, GAP_FLOOR);
}

export function rawSkillGap(band: number | null | undefined, target: number): number {
  if (band == null || band <= 0) return target;
  return Math.max(0, target - band);
}

export function classifySkill(gap: number): SkillDifficulty {
  return gap >= HARD_GAP_THRESHOLD ? "hard" : "easy";
}

export function isFoundationPath(bands: SkillBands): boolean {
  for (const key of SKILL_ORDER) {
    const band = bands[key];
    if (band == null || band <= 0) return false;
    if (band >= FOUNDATION_BAND_THRESHOLD) return false;
  }
  return true;
}

/** Largest Remainder (Hamilton) — allocations sum exactly to totalDays. */
export function allocateDays(
  gaps: SkillGapMap,
  totalDays: number,
): SkillDayAllocation {
  const sum = SKILL_ORDER.reduce((acc, key) => acc + gaps[key], 0);
  if (sum <= 0 || totalDays <= 0) {
    const even = Math.floor(totalDays / SKILL_ORDER.length);
    const out = Object.fromEntries(
      SKILL_ORDER.map((k) => [k, even]),
    ) as SkillDayAllocation;
    let remain = totalDays - even * SKILL_ORDER.length;
    for (const key of SKILL_ORDER) {
      if (remain <= 0) break;
      out[key] += 1;
      remain -= 1;
    }
    return out;
  }

  const quotas = SKILL_ORDER.map((key) => ({
    key,
    quota: (gaps[key] / sum) * totalDays,
  }));
  const floors = quotas.map(({ key, quota }) => ({
    key,
    floor: Math.floor(quota),
    remainder: quota - Math.floor(quota),
  }));
  const allocated = Object.fromEntries(
    floors.map(({ key, floor }) => [key, floor]),
  ) as SkillDayAllocation;
  let remain = totalDays - floors.reduce((acc, row) => acc + row.floor, 0);
  const sorted = [...floors].sort((a, b) => b.remainder - a.remainder);
  let i = 0;
  while (remain > 0) {
    const key = sorted[i % sorted.length].key;
    allocated[key] += 1;
    remain -= 1;
    i += 1;
  }
  return allocated;
}

function gapMap(bands: SkillBands, target: number, useFloor: boolean): SkillGapMap {
  return {
    listening: useFloor
      ? skillGap(bands.listening, target)
      : rawSkillGap(bands.listening, target),
    reading: useFloor
      ? skillGap(bands.reading, target)
      : rawSkillGap(bands.reading, target),
    writing: useFloor
      ? skillGap(bands.writing, target)
      : rawSkillGap(bands.writing, target),
    speaking: useFloor
      ? skillGap(bands.speaking, target)
      : rawSkillGap(bands.speaking, target),
  };
}

function pickFromPool(
  pool: SkillKey[],
  gaps: SkillGapMap,
  lastSkill: SkillKey | null,
  consecutive: number,
  alternation: Record<SkillKey, number>,
): SkillKey {
  const eligible = pool.filter((skill) => {
    if (lastSkill === skill && consecutive >= 2) return false;
    return true;
  });
  const candidates = eligible.length > 0 ? eligible : [...pool];
  candidates.sort((a, b) => {
    const gapDiff = gaps[b] - gaps[a];
    if (gapDiff !== 0) return gapDiff;
    return alternation[a] - alternation[b];
  });
  const pick = candidates[0];
  alternation[pick] += 1;
  return pick;
}

export function buildSessionOrder(
  bands: SkillBands,
  target: number,
): { kind: SessionPathKind; order: SkillKey[] } {
  if (isFoundationPath(bands)) {
    return {
      kind: "foundation",
      order: ["listening", "reading", "writing", "speaking"],
    };
  }

  const gaps = gapMap(bands, target, true);
  const order: SkillKey[] = [];
  let lastSkill: SkillKey | null = null;
  let consecutive = 0;
  const alternation: Record<SkillKey, number> = {
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
  };

  for (const slot of MIXED_TEMPLATE) {
    const pool = slot === "H" ? HARD_POOL : EASY_POOL;
    const pick = pickFromPool(pool, gaps, lastSkill, consecutive, alternation);
    if (pick === lastSkill) {
      consecutive += 1;
    } else {
      lastSkill = pick;
      consecutive = 1;
    }
    order.push(pick);
  }

  return { kind: "mixed", order };
}

const SKILL_SHORT: Record<SkillKey, string> = {
  listening: "L",
  reading: "R",
  writing: "W",
  speaking: "S",
};

export function formatSessionOrder(order: SkillKey[]): string {
  return order.map((k) => SKILL_SHORT[k]).join(", ");
}

function focusSkillsFromGaps(rawGaps: SkillGapMap): SkillKey[] {
  const ranked = [...SKILL_ORDER].sort(
    (a, b) => (rawGaps[b] ?? 0) - (rawGaps[a] ?? 0),
  );
  const topGap = rawGaps[ranked[0]] ?? 0;
  if (topGap <= 0) return [];
  const tied = ranked.filter((k) => (rawGaps[k] ?? 0) === topGap);
  if (tied.length >= 2) return tied.slice(0, 2);
  const secondGap = rawGaps[ranked[1]] ?? 0;
  if (secondGap > 0 && Math.abs(topGap - secondGap) <= 0.5) {
    return [ranked[0], ranked[1]];
  }
  return [ranked[0]];
}

function focusLabel(skills: SkillKey[]): string {
  if (skills.length === 0) return "Balanced across all skills";
  const names = skills.map((s) => {
    if (s === "listening") return "Listening";
    if (s === "reading") return "Reading";
    if (s === "writing") return "Writing";
    return "Speaking";
  });
  return names.join(" & ");
}

export function buildPlanPreview(input: {
  bands: SkillBands;
  target: number;
  examDate: string;
}): PlanPreview {
  const { bands, target, examDate } = input;
  const flooredGaps = gapMap(bands, target, true);
  const rawGaps = gapMap(bands, target, false);
  const totalDays = totalPrepDays(examDate);
  const daysRemaining = daysUntilExam(examDate);

  const difficulty = Object.fromEntries(
    SKILL_ORDER.map((key) => [key, classifySkill(flooredGaps[key] ?? GAP_FLOOR)]),
  ) as Record<SkillKey, SkillDifficulty>;

  const focusSkills = focusSkillsFromGaps(rawGaps);
  const { kind, order } = buildSessionOrder(bands, target);
  const dayAllocation = allocateDays(flooredGaps, totalDays);

  const sessionPathDescription =
    kind === "foundation"
      ? "Daily order: Listening → Reading → Writing → Speaking"
      : `Daily rhythm: Hard · Easy · Hard · Hard · Easy (${formatSessionOrder(order)})`;

  return {
    targetBand: target,
    examDate,
    daysRemaining,
    totalDays,
    gaps: flooredGaps,
    rawGaps,
    difficulty,
    focusSkills,
    focusLabel: focusLabel(focusSkills),
    sessionPathKind: kind,
    sessionOrder: order,
    sessionOrderLabels: order.map((k) => SKILL_SHORT[k]),
    dayAllocation,
    sessionPathDescription,
  };
}
