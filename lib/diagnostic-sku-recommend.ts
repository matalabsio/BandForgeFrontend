/**
 * Diagnostic → Multi-SKU recommendation (Phase 1).
 *
 * Pure / deterministic — no API, no side effects.
 * See docs/diagnostic-to-personalized-plan.md §5.
 *
 * Slug string constants are defined here (same literals as payments / entitlements)
 * so Node unit tests can import this module without resolving the `@/` alias.
 */

import type { SkillBands, SkillKey } from "./diagnostic-performance";

export const DEFAULT_WEAK_GAP = 1.0;

export const WRITING_SKILL_SLUG = "writing_skill";
export const SPEAKING_SKILL_SLUG = "speaking_skill";
export const DUAL_BUNDLE_SLUG = "dual_bundle";
export const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";

export type RecommendableSlug =
  | typeof WRITING_SKILL_SLUG
  | typeof SPEAKING_SKILL_SLUG
  | typeof DUAL_BUNDLE_SLUG
  | typeof FULL_SKILL_PROGRAM_SLUG;

export type SkuRecommendation = {
  primary: RecommendableSlug;
  reason: string;
  weakSkills: SkillKey[];
  alternatives: RecommendableSlug[];
};

export type RecommendSkuInput = {
  bands: SkillBands;
  targetBand: number;
  /** Minimum gap (inclusive) to treat a scored skill as weak. Default 1.0. */
  weakGap?: number;
};

const SKILL_ORDER: SkillKey[] = ["listening", "reading", "writing", "speaking"];

const REASON: Record<RecommendableSlug, string> = {
  [DUAL_BUNDLE_SLUG]:
    "Your biggest gaps are Writing and Speaking — close both together.",
  [WRITING_SKILL_SLUG]: "Writing is holding your overall band back.",
  [SPEAKING_SKILL_SLUG]: "Speaking is the priority skill to fix first.",
  [FULL_SKILL_PROGRAM_SLUG]:
    "Gaps across all skills — you need a full personalised plan.",
};

/** Display order for secondary cards (primary excluded). */
function alternativesFor(primary: RecommendableSlug): RecommendableSlug[] {
  switch (primary) {
    case WRITING_SKILL_SLUG:
      return [SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG, FULL_SKILL_PROGRAM_SLUG];
    case SPEAKING_SKILL_SLUG:
      return [WRITING_SKILL_SLUG, DUAL_BUNDLE_SLUG, FULL_SKILL_PROGRAM_SLUG];
    case DUAL_BUNDLE_SLUG:
      return [WRITING_SKILL_SLUG, SPEAKING_SKILL_SLUG, FULL_SKILL_PROGRAM_SLUG];
    case FULL_SKILL_PROGRAM_SLUG:
      return [WRITING_SKILL_SLUG, SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG];
  }
}

function isScored(band: number | null | undefined): band is number {
  return band != null && band > 0;
}

/** gap(skill) = max(targetBand − skillBand, 0) — scored skills only. */
export function scoredSkillGap(band: number, targetBand: number): number {
  return Math.max(targetBand - band, 0);
}

/**
 * Scored skills with gap ≥ weakGap.
 * Pending / missing / non-positive bands are never weak.
 */
export function collectWeakSkills(
  bands: SkillBands,
  targetBand: number,
  weakGap: number = DEFAULT_WEAK_GAP,
): SkillKey[] {
  const weak: SkillKey[] = [];
  for (const key of SKILL_ORDER) {
    const band = bands[key];
    if (!isScored(band)) continue;
    if (scoredSkillGap(band, targetBand) >= weakGap) {
      weak.push(key);
    }
  }
  return weak;
}

function recommendationFromWeak(weak: ReadonlySet<SkillKey>): RecommendableSlug {
  const listeningWeak = weak.has("listening");
  const readingWeak = weak.has("reading");
  const writingWeak = weak.has("writing");
  const speakingWeak = weak.has("speaking");

  if (weak.size >= 3 || (listeningWeak && readingWeak)) {
    return FULL_SKILL_PROGRAM_SLUG;
  }
  if (writingWeak && speakingWeak) {
    return DUAL_BUNDLE_SLUG;
  }
  if (writingWeak) {
    return WRITING_SKILL_SLUG;
  }
  if (speakingWeak) {
    return SPEAKING_SKILL_SLUG;
  }
  if (listeningWeak || readingWeak) {
    return FULL_SKILL_PROGRAM_SLUG;
  }
  return FULL_SKILL_PROGRAM_SLUG;
}

/**
 * Pick the primary sellable SKU from diagnostic skill bands vs target.
 */
export function recommendSkuFromDiagnostic(
  input: RecommendSkuInput,
): SkuRecommendation {
  const weakGap = input.weakGap ?? DEFAULT_WEAK_GAP;
  const weakSkills = collectWeakSkills(input.bands, input.targetBand, weakGap);
  const primary = recommendationFromWeak(new Set(weakSkills));

  return {
    primary,
    reason: REASON[primary],
    weakSkills,
    alternatives: alternativesFor(primary),
  };
}
