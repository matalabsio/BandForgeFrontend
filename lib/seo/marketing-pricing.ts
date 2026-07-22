/** Playbook-aligned pricing cards for public marketing surfaces. */

import type { Plan } from "@/lib/payments";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  HUMAN_REVIEW_SLA,
  SPRINT_ACCESS_DAYS,
  SPRINT_PLANS,
  SPRINT_TASK_COUNT,
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

const sprintDescription = `${SPRINT_TASK_COUNT} tasks over ${SPRINT_ACCESS_DAYS} days — AI instantly, Band 9 human review ${HUMAN_REVIEW_SLA}, 1 mock on completion.`;

export const HOMEPAGE_PRICING_TIERS: MarketingPricingTier[] = [
  FREE_DIAGNOSTIC_TIER,
  ...SPRINT_PLANS.map((plan) => ({
    id: plan.slug,
    name: plan.name,
    price: formatPriceInr(plan.priceInr),
    period: `/ ${SPRINT_ACCESS_DAYS} days`,
    description: sprintDescription,
    cta: `View ${plan.name}`,
    href: "/pricing",
    recommended: plan.slug === "dual-sprint",
    variant: (plan.slug === "dual-sprint" ? "primary" : "outline") as
      | "outline"
      | "primary",
  })),
];

/** Static plan rows when the payments API is unavailable (SEO + reference pricing). */
export function sprintPlansToFallbackPlans(): Plan[] {
  return SPRINT_PLANS.map((plan, index) => ({
    id: plan.slug,
    slug: plan.slug,
    name: plan.name,
    description: plan.schemaDescription,
    amount: plan.priceInr,
    currency: "INR",
    duration_days: SPRINT_ACCESS_DAYS,
    sort_order: index,
  }));
}

export const PLAYBOOK_HOW_STEPS = [
  { n: 1, title: "Diagnose", body: "Take the free 15-minute diagnostic." },
  { n: 2, title: "See your bands", body: "Get section-wise scores for all four skills." },
  { n: 3, title: "Pick a sprint", body: "Choose Writing, Speaking, Dual, or All Skills." },
  { n: 4, title: "Practice", body: "Complete 12 structured tasks over 90 days." },
  { n: 5, title: "Get feedback", body: "AI instantly; Band 9 human review within 48 hours." },
  { n: 6, title: "Finish strong", body: "Unlock a full mock; Completion Guarantee if needed." },
] as const;
