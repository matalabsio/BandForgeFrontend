/** Playbook-aligned pricing cards for public marketing surfaces. */

import type { Plan } from "@/lib/payments";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  FULL_SKILL_PROGRAM,
  HUMAN_REVIEW_SLA,
  PAID_PLANS,
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

export const HOMEPAGE_PRICING_TIERS: MarketingPricingTier[] = [
  FREE_DIAGNOSTIC_TIER,
  {
    id: FULL_SKILL_PROGRAM.slug,
    name: FULL_SKILL_PROGRAM.name,
    price: formatPriceInr(FULL_SKILL_PROGRAM.priceInr),
    period: "one-time",
    description: programDescription,
    cta: "View Full Skill Program",
    href: "/pricing",
    recommended: true,
    variant: "primary",
  },
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
    duration_days: 365,
    sort_order: index,
  }));
}

export const PLAYBOOK_HOW_STEPS = [
  { n: 1, title: "Diagnose", body: "Take the free 15-minute diagnostic." },
  { n: 2, title: "See your bands", body: "Get section-wise scores for all four skills." },
  { n: 3, title: "Unlock your plan", body: "Get the Full Skill Program — all four skills in one program." },
  { n: 4, title: "Practice", body: "Follow your personalised daily plan until exam day." },
  { n: 5, title: "Get feedback", body: "AI instantly; Band 9 human review within 48 hours." },
  { n: 6, title: "Finish strong", body: "Unlock a full mock; Completion Guarantee if needed." },
] as const;
