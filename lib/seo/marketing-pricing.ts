/** Playbook-aligned pricing cards for public marketing surfaces. */

import type { Plan } from "@/lib/payments";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  DUAL_BUNDLE_PLAN,
  FULL_SKILL_PROGRAM,
  HUMAN_REVIEW_SLA,
  PAID_PLANS,
  SPEAKING_SKILL_PLAN,
  WRITING_SKILL_PLAN,
  formatPriceInr,
} from "@/lib/seo/claims";

export type MarketingPricingTier = {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  cta: string;
  href: string;
  recommended?: boolean;
  variant: "outline" | "primary";
};

export const FREE_DIAGNOSTIC_TIER: MarketingPricingTier = {
  id: "free-diagnostic",
  name: "Free Diagnostic",
  price: "₹0",
  description: `Section-wise band scores in ${DIAGNOSTIC_DURATION_MINUTES} minutes — no payment, no trial.`,
  cta: "Take the diagnostic",
  href: "/diagnostic",
  variant: "outline",
};

const programDescription = `All four skills — 48 practice hubs, personalised plan until your exam, AI instantly, Band 9 human review ${HUMAN_REVIEW_SLA}, 4 full mocks on completion.`;

/** Four paid SKUs for pricing page strips and SEO surfaces. */
export const PAID_PRICING_TIERS: MarketingPricingTier[] = [
  {
    id: WRITING_SKILL_PLAN.slug,
    name: WRITING_SKILL_PLAN.name,
    price: formatPriceInr(WRITING_SKILL_PLAN.priceInr),
    period: "one-time",
    description:
      "12 Writing practice hubs, Academic or General Training track, 1 Writing mock.",
    cta: "View Writing Skill",
    href: "/pricing#plan-writing_skill",
    variant: "outline",
  },
  {
    id: SPEAKING_SKILL_PLAN.slug,
    name: SPEAKING_SKILL_PLAN.name,
    price: formatPriceInr(SPEAKING_SKILL_PLAN.priceInr),
    period: "one-time",
    description:
      "Speaking across Part 1–3, AI transcription and band-descriptor feedback, 1 Speaking mock.",
    cta: "View Speaking Skill",
    href: "/pricing#plan-speaking_skill",
    variant: "outline",
  },
  {
    id: DUAL_BUNDLE_PLAN.slug,
    name: DUAL_BUNDLE_PLAN.name,
    price: formatPriceInr(DUAL_BUNDLE_PLAN.priceInr),
    period: "one-time",
    description: "Writing + Speaking inventory together, 2 skill mocks.",
    cta: "View Dual Bundle",
    href: "/pricing#plan-dual_bundle",
    recommended: true,
    variant: "outline",
  },
  {
    id: FULL_SKILL_PROGRAM.slug,
    name: FULL_SKILL_PROGRAM.name,
    price: formatPriceInr(FULL_SKILL_PROGRAM.priceInr),
    period: "one-time",
    description: programDescription,
    cta: "View Full Skill Program",
    href: "/pricing#plan-full_skill_program",
    variant: "primary",
  },
];

export const HOMEPAGE_PRICING_TIERS: MarketingPricingTier[] = [
  FREE_DIAGNOSTIC_TIER,
  PAID_PRICING_TIERS[3]!,
];

/** Static plan rows when the payments API is unavailable (SEO + reference pricing). */
export function sprintPlansToFallbackPlans(): Plan[] {
  return PAID_PLANS.map((plan, index) => ({
    id: plan.slug,
    slug: plan.slug,
    name: plan.name,
    description: plan.schemaDescription,
    amount: plan.priceInr * 100,
    currency: "INR",
    duration_days: plan.durationDays ?? 180,
    sort_order: index,
  }));
}

export const PLAYBOOK_HOW_STEPS = [
  { n: 1, title: "Diagnose", body: "Take the free 15-minute diagnostic." },
  { n: 2, title: "See your bands", body: "Get section-wise scores for all four skills." },
  { n: 3, title: "Unlock your plan", body: "Choose a skill pack or the Full Skill Program." },
  { n: 4, title: "Practice", body: "Follow your personalised daily plan until exam day." },
  { n: 5, title: "Get feedback", body: "AI instantly; Band 9 human review within 48 hours." },
  { n: 6, title: "Finish strong", body: "Unlock a full mock; Completion Guarantee if needed." },
] as const;
