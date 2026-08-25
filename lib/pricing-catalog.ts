import type { Plan } from "@/lib/payments";
import {
  buildPricingCatalogRows,
  DUAL_BUNDLE_SLUG,
  FULL_SKILL_PROGRAM_SLUG,
  PRICING_SKU_ORDER,
  SPEAKING_SKILL_SLUG,
  WRITING_SKILL_SLUG,
  type PricingCatalogRow,
} from "@/lib/diagnostic-sku-offer";

export {
  DUAL_BUNDLE_SLUG,
  FULL_SKILL_PROGRAM_SLUG,
  PRICING_SKU_ORDER,
  SPEAKING_SKILL_SLUG,
  WRITING_SKILL_SLUG,
};

export type PricingDisplayPlan = Plan & {
  isActive: boolean;
  comingSoon: boolean;
  chips: string[];
  subtitle: string;
  cta: string;
  features: string[];
  guarantee: string;
  priceNote: string;
};

/** Map API plans (or empty) into four fixed catalog cards for /pricing. */
export function buildPricingDisplayPlans(
  apiPlans: ReadonlyArray<Plan>,
): PricingDisplayPlan[] {
  const activeAmounts = apiPlans.map((p) => ({
    slug: p.slug,
    amount: p.amount,
  }));

  return buildPricingCatalogRows(activeAmounts).map(catalogRowToDisplayPlan);
}

function catalogRowToDisplayPlan(row: PricingCatalogRow): PricingDisplayPlan {
  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    description: row.subtitle,
    amount: row.amountPaise,
    currency: "INR",
    duration_days: row.durationDays,
    sort_order: PRICING_SKU_ORDER.indexOf(row.slug),
    isActive: row.isActive,
    comingSoon: row.comingSoon,
    chips: row.chips,
    subtitle: row.subtitle,
    cta: row.cta,
    features: row.features,
    guarantee: row.guarantee,
    priceNote: row.priceNote,
  };
}

export type PlanComparisonRow = {
  slug: string;
  name: string;
  skills: string;
  duration: string;
  mocks: string;
  personalizedPlan: boolean;
};

export const PRICING_COMPARISON_ROWS: PlanComparisonRow[] = [
  {
    slug: WRITING_SKILL_SLUG,
    name: "Writing Skill",
    skills: "Writing",
    duration: "180 days",
    mocks: "1 Writing mock",
    personalizedPlan: false,
  },
  {
    slug: SPEAKING_SKILL_SLUG,
    name: "Speaking Skill",
    skills: "Speaking",
    duration: "180 days",
    mocks: "1 Speaking mock",
    personalizedPlan: false,
  },
  {
    slug: DUAL_BUNDLE_SLUG,
    name: "Dual Bundle",
    skills: "Writing + Speaking",
    duration: "180 days",
    mocks: "2 skill mocks",
    personalizedPlan: false,
  },
  {
    slug: FULL_SKILL_PROGRAM_SLUG,
    name: "Full Skill Program",
    skills: "All four skills",
    duration: "Until exam date",
    mocks: "4 full mocks",
    personalizedPlan: true,
  },
];
