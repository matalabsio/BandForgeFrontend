/**
 * Diagnostic results plan catalog + soft-launch price fallbacks.
 * Keep catalog/reasons aligned with diagnostic-sku-offer.ts CATALOG.
 */

export type StudyPlanWeek = {
  title: string;
  items: string[];
};

export const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
export const WRITING_SKILL_SLUG = "writing_skill";
export const SPEAKING_SKILL_SLUG = "speaking_skill";
export const DUAL_BUNDLE_SLUG = "dual_bundle";

export type RecommendableSlug =
  | typeof WRITING_SKILL_SLUG
  | typeof SPEAKING_SKILL_SLUG
  | typeof DUAL_BUNDLE_SLUG
  | typeof FULL_SKILL_PROGRAM_SLUG;

export type DiagnosticSkuCard = {
  slug: RecommendableSlug;
  name: string;
  subtitle: string;
  priceNote: string;
  features: string[];
  guarantee: string;
  cta: string;
  reason: string;
  chips: string[];
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

export const DIAGNOSTIC_SKU_CATALOG: Record<
  RecommendableSlug,
  DiagnosticSkuCard
> = {
  [WRITING_SKILL_SLUG]: {
    slug: WRITING_SKILL_SLUG,
    name: "Writing Skill",
    subtitle: "Task 1 + Task 2 · Academic or General Training",
    priceNote: "one-time",
    features: [
      "12 Writing practice hubs (Task 1 + Task 2)",
      "Hard sequential unlock — finish one set to open the next",
      "Academic or General Training track (you choose)",
      "1 full Writing mock after course completion",
    ],
    guarantee: "Focused Writing path from your diagnostic gaps",
    cta: "Buy Writing Skill",
    reason: "Writing is holding your overall band back.",
    chips: ["Writing only", "180 days", "1 mock"],
  },
  [SPEAKING_SKILL_SLUG]: {
    slug: SPEAKING_SKILL_SLUG,
    name: "Speaking Skill",
    subtitle: "Part 1 · Part 2 · Part 3",
    priceNote: "one-time",
    features: [
      "Speaking practice across all three IELTS parts",
      "Record → AI transcription → band-descriptor feedback",
      "Human review path for examiner-style notes",
      "1 full Speaking mock after course completion",
    ],
    guarantee: "Speaking-first practice matched to your gap",
    cta: "Buy Speaking Skill",
    reason: "Speaking is the priority skill to fix first.",
    chips: ["Speaking only", "180 days", "1 mock"],
  },
  [DUAL_BUNDLE_SLUG]: {
    slug: DUAL_BUNDLE_SLUG,
    name: "Dual Bundle",
    subtitle: "Writing + Speaking together",
    priceNote: "one-time",
    features: [
      "Full Writing Skill + Speaking Skill inventory",
      "Close both production skills in one purchase",
      "AI + examiner-style feedback on W and S",
      "2 skill mocks (Writing + Speaking)",
    ],
    guarantee: "Personalised recommendation for your Writing & Speaking gaps",
    cta: "Buy Dual Bundle",
    reason:
      "Your biggest gaps are Writing and Speaking — close both together.",
    chips: ["Writing + Speaking", "2 mocks", "Best for W+S gaps"],
  },
  [FULL_SKILL_PROGRAM_SLUG]: {
    slug: FULL_SKILL_PROGRAM_SLUG,
    name: "Full Skill Program",
    subtitle: "Listening · Reading · Writing · Speaking",
    priceNote: "one-time",
    features: [
      "48 practice hubs (12 per skill)",
      "Personalised daily plan until your exam",
      "4 full mocks (unlock after 12/12 per skill)",
      "AI + examiner-reviewed Writing & Speaking",
    ],
    guarantee: "Personalised plan built from your diagnostic scores",
    cta: "Start my plan",
    reason: "Gaps across all skills — you need a full personalised plan.",
    chips: ["All 4 skills", "Exam-date paced", "Full mock unlock"],
  },
};

/** Legacy FSP card shape for flag-OFF DiagnosticPlanBundleCard. */
export type FullSkillProgramCard = {
  slug: typeof FULL_SKILL_PROGRAM_SLUG;
  name: string;
  subtitle: string;
  priceNote: string;
  features: string[];
  guarantee: string;
  cta: string;
  badge: string;
  chips: string[];
};

export const FULL_SKILL_PROGRAM: FullSkillProgramCard = {
  slug: FULL_SKILL_PROGRAM_SLUG,
  name: DIAGNOSTIC_SKU_CATALOG[FULL_SKILL_PROGRAM_SLUG].name,
  subtitle: DIAGNOSTIC_SKU_CATALOG[FULL_SKILL_PROGRAM_SLUG].subtitle,
  priceNote: DIAGNOSTIC_SKU_CATALOG[FULL_SKILL_PROGRAM_SLUG].priceNote,
  features: DIAGNOSTIC_SKU_CATALOG[FULL_SKILL_PROGRAM_SLUG].features,
  guarantee: DIAGNOSTIC_SKU_CATALOG[FULL_SKILL_PROGRAM_SLUG].guarantee,
  cta: DIAGNOSTIC_SKU_CATALOG[FULL_SKILL_PROGRAM_SLUG].cta,
  badge: "Recommended for you",
  chips: DIAGNOSTIC_SKU_CATALOG[FULL_SKILL_PROGRAM_SLUG].chips,
};

export const DIAGNOSTIC_STUDY_PLAN_WEEKS: StudyPlanWeek[] = [
  {
    title: "Week 1 · Foundations",
    items: [
      "Listening & Reading warm-up sets",
      "Writing Task 1 structure",
      "Speaking Part 1 fluency",
      "Gap-focused skill rotation",
    ],
  },
  {
    title: "Week 2 · Production skills",
    items: [
      "Writing Task 2 essays + AI review",
      "Speaking Part 2 cue cards",
      "Timed practice sets",
      "Band 9 model breakdowns",
    ],
  },
  {
    title: "Week 3 · Exam push",
    items: [
      "Mixed Hard/Easy daily rhythm",
      "Full skill mock prep",
      "Weak-skill focus days",
      "Exam-week consolidation",
    ],
  },
];

/** Format paise amount from API as INR display. */
export function formatPlanPriceInr(amountPaise: number): string {
  const rupees = amountPaise / 100;
  if (Number.isInteger(rupees)) {
    return `₹${rupees.toLocaleString("en-IN")}`;
  }
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
