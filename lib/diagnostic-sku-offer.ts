/**
 * Phase 2 — diagnostic multi-SKU offer view-model (pure).
 * Self-contained for Node unit tests (no runtime path imports).
 * Catalog mirrors diagnostic-plan-content.ts — keep in sync.
 */

import type { SkillBands, SkillKey } from "./diagnostic-performance";

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

/** Soft-launch marketing amounts (paise) when plan is missing from /plans. */
export const DIAGNOSTIC_SKU_FALLBACK_AMOUNT_PAISE: Record<
  RecommendableSlug,
  number
> = {
  [WRITING_SKILL_SLUG]: 89900,
  [SPEAKING_SKILL_SLUG]: 89900,
  [DUAL_BUNDLE_SLUG]: 179900,
  [FULL_SKILL_PROGRAM_SLUG]: 249900,
};

type CatalogCard = {
  name: string;
  subtitle: string;
  priceNote: string;
  features: string[];
  chips: string[];
  guarantee: string;
  cta: string;
  reason: string;
};

const CATALOG: Record<RecommendableSlug, CatalogCard> = {
  [WRITING_SKILL_SLUG]: {
    name: "Writing Skill",
    subtitle: "Task 1 + Task 2 · Academic or General Training",
    priceNote: "one-time",
    features: [
      "12 Writing practice hubs (Task 1 + Task 2)",
      "Hard sequential unlock — finish one set to open the next",
      "Academic or General Training track (you choose)",
      "1 full Writing mock after course completion",
    ],
    chips: ["Writing only", "180 days", "1 mock"],
    guarantee: "Focused Writing path from your diagnostic gaps",
    cta: "Buy Writing Skill",
    reason: "Writing is holding your overall band back.",
  },
  [SPEAKING_SKILL_SLUG]: {
    name: "Speaking Skill",
    subtitle: "Part 1 · Part 2 · Part 3",
    priceNote: "one-time",
    features: [
      "Speaking practice across all three IELTS parts",
      "Record → AI transcription → band-descriptor feedback",
      "Human review path for examiner-style notes",
      "1 full Speaking mock after course completion",
    ],
    chips: ["Speaking only", "180 days", "1 mock"],
    guarantee: "Speaking-first practice matched to your gap",
    cta: "Buy Speaking Skill",
    reason: "Speaking is the priority skill to fix first.",
  },
  [DUAL_BUNDLE_SLUG]: {
    name: "Dual Bundle",
    subtitle: "Writing + Speaking together",
    priceNote: "one-time",
    features: [
      "Full Writing Skill + Speaking Skill inventory",
      "Close both production skills in one purchase",
      "AI + examiner-style feedback on W and S",
      "2 skill mocks (Writing + Speaking)",
    ],
    chips: ["Writing + Speaking", "2 mocks", "Best for W+S gaps"],
    guarantee: "Personalised recommendation for your Writing & Speaking gaps",
    cta: "Buy Dual Bundle",
    reason:
      "Your biggest gaps are Writing and Speaking — close both together.",
  },
  [FULL_SKILL_PROGRAM_SLUG]: {
    name: "Full Skill Program",
    subtitle: "Listening · Reading · Writing · Speaking",
    priceNote: "one-time",
    features: [
      "48 practice hubs (12 per skill)",
      "Personalised daily plan until your exam",
      "4 full mocks (unlock after 12/12 per skill)",
      "AI + examiner-reviewed Writing & Speaking",
    ],
    chips: ["All 4 skills", "Exam-date paced", "Full mock unlock"],
    guarantee: "Personalised plan built from your diagnostic scores",
    cta: "Start my plan",
    reason: "Gaps across all skills — you need a full personalised plan.",
  },
};

export type ActivePlanAmount = {
  slug: string;
  amount: number;
};

export type SkuOfferCardModel = {
  slug: RecommendableSlug;
  name: string;
  subtitle: string;
  priceLabel: string;
  priceNote: string;
  features: string[];
  chips: string[];
  guarantee: string;
  cta: string;
  isActive: boolean;
  comingSoon: boolean;
};

export type MultiSkuOfferView = {
  idealPrimary: RecommendableSlug;
  displayPrimary: RecommendableSlug;
  reason: string;
  weakSkills: SkillKey[];
  fellBackFromInactive: boolean;
  primary: SkuOfferCardModel;
  secondary: SkuOfferCardModel[];
  pendingNote: string | null;
};

function formatPlanPriceInr(amountPaise: number): string {
  const rupees = amountPaise / 100;
  if (Number.isInteger(rupees)) {
    return `₹${rupees.toLocaleString("en-IN")}`;
  }
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isScored(band: number | null | undefined): boolean {
  return band != null && band > 0;
}

export function pendingRecommendationNote(bands: SkillBands): string | null {
  const writingPending = !isScored(bands.writing);
  const speakingPending = !isScored(bands.speaking);
  if (speakingPending) {
    return "Recommendation may update when Speaking review is ready.";
  }
  if (writingPending) {
    return "Recommendation may update when Writing evaluation is ready.";
  }
  return null;
}

export function isPlanSlugActive(
  slug: RecommendableSlug,
  activePlans: ReadonlyArray<ActivePlanAmount>,
): boolean {
  return activePlans.some((p) => p.slug === slug);
}

export function resolveSkuPricePaise(
  slug: RecommendableSlug,
  activePlans: ReadonlyArray<ActivePlanAmount>,
): number {
  const live = activePlans.find((p) => p.slug === slug);
  if (live && live.amount > 0) return live.amount;
  return DIAGNOSTIC_SKU_FALLBACK_AMOUNT_PAISE[slug];
}

export function resolveDisplayPrimary(
  recommendation: SkuRecommendation,
  activePlans: ReadonlyArray<ActivePlanAmount>,
): { displayPrimary: RecommendableSlug; fellBack: boolean } {
  const ideal = recommendation.primary;
  if (isPlanSlugActive(ideal, activePlans)) {
    return { displayPrimary: ideal, fellBack: false };
  }
  for (const slug of recommendation.alternatives) {
    if (isPlanSlugActive(slug, activePlans)) {
      return { displayPrimary: slug, fellBack: true };
    }
  }
  if (isPlanSlugActive(FULL_SKILL_PROGRAM_SLUG, activePlans)) {
    return { displayPrimary: FULL_SKILL_PROGRAM_SLUG, fellBack: true };
  }
  return { displayPrimary: ideal, fellBack: false };
}

function cardModel(
  slug: RecommendableSlug,
  activePlans: ReadonlyArray<ActivePlanAmount>,
): SkuOfferCardModel {
  const catalog = CATALOG[slug];
  const isActive = isPlanSlugActive(slug, activePlans);
  const amount = resolveSkuPricePaise(slug, activePlans);
  return {
    slug,
    name: catalog.name,
    subtitle: catalog.subtitle,
    priceLabel: formatPlanPriceInr(amount),
    priceNote: catalog.priceNote,
    features: catalog.features,
    chips: catalog.chips,
    guarantee: catalog.guarantee,
    cta: catalog.cta,
    isActive,
    comingSoon: !isActive,
  };
}

export function buildMultiSkuOfferView(input: {
  recommendation: SkuRecommendation;
  bands: SkillBands;
  activePlans: ReadonlyArray<ActivePlanAmount>;
}): MultiSkuOfferView {
  const { recommendation, bands, activePlans } = input;
  const { displayPrimary, fellBack } = resolveDisplayPrimary(
    recommendation,
    activePlans,
  );

  const reason = fellBack
    ? CATALOG[displayPrimary].reason
    : recommendation.reason;

  const secondarySlugs: RecommendableSlug[] = [];
  if (recommendation.primary !== displayPrimary) {
    secondarySlugs.push(recommendation.primary);
  }
  for (const slug of recommendation.alternatives) {
    if (slug === displayPrimary) continue;
    if (secondarySlugs.includes(slug)) continue;
    secondarySlugs.push(slug);
  }

  return {
    idealPrimary: recommendation.primary,
    displayPrimary,
    reason,
    weakSkills: recommendation.weakSkills,
    fellBackFromInactive: fellBack,
    primary: cardModel(displayPrimary, activePlans),
    secondary: secondarySlugs.map((slug) => cardModel(slug, activePlans)),
    pendingNote: pendingRecommendationNote(bands),
  };
}
