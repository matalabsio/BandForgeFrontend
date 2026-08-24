/** Playbook Section 8 — canonical product claims (keep in sync sitewide). */

export const DIAGNOSTIC_DURATION_MINUTES = 15;
export const SPRINT_ACCESS_DAYS = 90;
export const SPRINT_TASK_COUNT = 12;
export const SPRINT_MOCK_COUNT = 1;
export const HUMAN_REVIEW_SLA = "within 48 hours";

export const OPERATOR_NAME = "MATA Labs OPC Private Limited";
export const OPERATOR_LOCATION = "Hyderabad, Telangana, India";

export const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";

export type PaidPlan = {
  name: string;
  priceInr: number;
  slug: string;
  schemaDescription: string;
};

/** Single purchasable SKU — matches backend `plans.slug`. */
export const FULL_SKILL_PROGRAM: PaidPlan = {
  name: "Full Skill Program",
  priceInr: 2499,
  slug: FULL_SKILL_PROGRAM_SLUG,
  schemaDescription:
    "All four IELTS skills — Listening, Reading, Writing, and Speaking — with 48 practice hubs, a personalised daily plan until your exam date, AI practice, and Band 9-trained human review within 48 hours. Free diagnostic included.",
};

/** Canonical paid plans for marketing and checkout surfaces. */
export const PAID_PLANS: PaidPlan[] = [FULL_SKILL_PROGRAM];

/** @deprecated Use PAID_PLANS or FULL_SKILL_PROGRAM */
export type SprintPlan = PaidPlan;

/** @deprecated Use PAID_PLANS or FULL_SKILL_PROGRAM */
export const SPRINT_PLANS = PAID_PLANS;

export function formatPriceInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
