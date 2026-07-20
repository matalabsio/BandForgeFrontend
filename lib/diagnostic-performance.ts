export type SkillKey = "listening" | "reading" | "writing" | "speaking";

export type SkillStatus = "on_track" | "strongest" | "focus_area" | "priority";

export type SkillBands = Record<SkillKey, number | null>;

const SKILL_LABELS: Record<SkillKey, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

/** Display band as a half-point range (e.g. 6.0 → "6.0–6.5"). */
export function bandRange(band: number | null | undefined): string {
  if (band == null || band <= 0) return "—";
  const low = Math.floor(band * 2) / 2;
  const high = Math.min(9, low + 0.5);
  if (low === high) return low.toFixed(1);
  return `${low.toFixed(1)}–${high.toFixed(1)}`;
}

/** Progress-bar fill percent for a skill, based on the range midpoint. */
export function bandBarPercent(band: number | null | undefined): number {
  if (band == null || band <= 0) return 0;
  const low = Math.floor(band * 2) / 2;
  const mid = Math.min(9, low + 0.25);
  return Math.round((mid / 9) * 100);
}

function rankedSkills(bands: SkillBands): { key: SkillKey; band: number }[] {
  return (Object.keys(bands) as SkillKey[])
    .map((key) => ({ key, band: bands[key] }))
    .filter((e): e is { key: SkillKey; band: number } => e.band != null && e.band > 0)
    .sort((a, b) => a.band - b.band);
}

/** Assign performance status per skill for results cards. */
export function skillStatuses(
  bands: SkillBands,
  targetBand = 7.0,
): Record<SkillKey, SkillStatus> {
  const defaultStatus: Record<SkillKey, SkillStatus> = {
    listening: "on_track",
    reading: "on_track",
    writing: "on_track",
    speaking: "on_track",
  };

  const ranked = rankedSkills(bands);
  if (ranked.length === 0) return defaultStatus;

  const result = { ...defaultStatus };
  const weakest = ranked[0];
  const strongest = ranked[ranked.length - 1];

  if (ranked.length === 1) {
    result[weakest.key] = "on_track";
    return result;
  }

  if (strongest.key !== weakest.key) {
    result[strongest.key] = "strongest";
    result[weakest.key] = "priority";
  }

  const secondWeakest = ranked.length > 2 ? ranked[1] : null;
  if (
    secondWeakest &&
    secondWeakest.key !== strongest.key &&
    secondWeakest.key !== weakest.key &&
    secondWeakest.band < targetBand
  ) {
    result[secondWeakest.key] = "focus_area";
  }

  return result;
}

export function coachingCopy(status: SkillStatus): string {
  switch (status) {
    case "strongest":
      return "Your anchor skill — lean on it.";
    case "focus_area":
      return "Needs focused practice.";
    case "priority":
      return "Holding your overall band back.";
    default:
      return "Solid base — keep sharpening.";
  }
}

export function skillLabel(key: SkillKey): string {
  return SKILL_LABELS[key];
}

export type HoldingBackNarrative = {
  weakest: SkillKey[];
  strongest: SkillKey[];
  narrative: string;
  reachBand: string;
};

/** Generate the navy analysis block copy from band data. */
export function holdingBackNarrative(
  bands: SkillBands,
  targetBand = 7.0,
): HoldingBackNarrative {
  const ranked = rankedSkills(bands);
  const weakest = ranked.slice(0, 2).map((e) => e.key);
  const strongest = ranked.slice(-2).map((e) => e.key);

  const weakLabels = weakest.map((k) => SKILL_LABELS[k]);
  const strongLabels = strongest
    .filter((k) => !weakest.includes(k))
    .map((k) => SKILL_LABELS[k]);

  const reachBand = Math.min(targetBand, Math.max(...ranked.map((r) => r.band)) + 1.5);
  const reachLabel = `${reachBand.toFixed(1).replace(/\.0$/, "")}+ overall`;

  let narrative: string;

  if (weakest.length >= 2 && strongLabels.length >= 1) {
    narrative = `Your ${weakLabels[0]} and ${weakLabels[1]} are roughly a full band below your ${strongLabels.join(" and ")}, and they're the two skills capping your overall result. In ${weakLabels[1]}, hesitation and limited range cost you fluency marks; in ${weakLabels[0]}, task response and cohesion are the gaps. Close these two and a ${reachLabel} is well within reach.`;
  } else if (weakest.length === 1) {
    narrative = `Your ${weakLabels[0]} is the main skill holding your overall band back. Focused practice here could close your gap to Band ${targetBand.toFixed(1)}.`;
  } else {
    narrative = `You're building a solid foundation across all four skills. A ${reachLabel} is well within reach with consistent practice.`;
  }

  return { weakest, strongest, narrative, reachBand: reachLabel };
}

export function overallBandGap(
  current: number | null | undefined,
  target: number,
): number {
  if (current == null || current <= 0) return target;
  return Math.max(0, target - current);
}

const SKILL_ORDER: SkillKey[] = ["listening", "reading", "writing", "speaking"];

/** Count skills with a scored band (> 0). */
export function scoredSkillCount(bands: SkillBands): number {
  return SKILL_ORDER.filter((key) => {
    const band = bands[key];
    return band != null && band > 0;
  }).length;
}

/** IELTS-style half-band average from scored skills only (matches backend aggregate). */
export function aggregateFromSkillBands(bands: SkillBands): number | null {
  const scored = SKILL_ORDER.map((key) => bands[key]).filter(
    (band): band is number => band != null && band > 0,
  );
  if (scored.length === 0) return null;
  const avg = scored.reduce((sum, band) => sum + band, 0) / scored.length;
  return Math.round(avg * 2) / 2;
}

export type BandGapSummary = {
  currentBand: number | null;
  gap: number;
  scoredCount: number;
  isPartial: boolean;
};

/** Derive overall band + gap from the same per-skill rows shown in the UI. */
export function bandGapSummary(
  bands: SkillBands,
  targetBand: number,
): BandGapSummary {
  const scoredCount = scoredSkillCount(bands);
  const currentBand = aggregateFromSkillBands(bands);
  return {
    currentBand,
    gap: overallBandGap(currentBand, targetBand),
    scoredCount,
    isPartial: scoredCount > 0 && scoredCount < SKILL_ORDER.length,
  };
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
