/** Playbook Section 8 — canonical product claims (keep in sync sitewide). */

export const DIAGNOSTIC_DURATION_MINUTES = 15;
export const SPRINT_ACCESS_DAYS = 90;
export const SPRINT_TASK_COUNT = 12;
export const SPRINT_MOCK_COUNT = 1;
export const HUMAN_REVIEW_SLA = "within 48 hours";

export const OPERATOR_NAME = "MATA Labs OPC Private Limited";
export const OPERATOR_LOCATION = "Hyderabad, Telangana, India";

export const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
export const WRITING_SKILL_SLUG = "writing_skill";
export const SPEAKING_SKILL_SLUG = "speaking_skill";
export const DUAL_BUNDLE_SLUG = "dual_bundle";

export type PaidPlan = {
  name: string;
  priceInr: number;
  slug: string;
  schemaDescription: string;
  durationDays?: number;
};

/** Full Skill Program — calendar personalised plan until exam date. */
export const FULL_SKILL_PROGRAM: PaidPlan = {
  name: "Full Skill Program",
  priceInr: 2499,
  slug: FULL_SKILL_PROGRAM_SLUG,
  durationDays: 365,
  schemaDescription:
    "All four IELTS skills — Listening, Reading, Writing, and Speaking — with 48 practice hubs, a personalised daily plan until your exam date, AI practice, and Band 9-trained human review within 48 hours. Free diagnostic included.",
};

export const WRITING_SKILL_PLAN: PaidPlan = {
  name: "Writing Skill",
  priceInr: 899,
  slug: WRITING_SKILL_SLUG,
  durationDays: 180,
  schemaDescription:
    "Focused IELTS Writing pack — 12 practice hubs (Task 1 + Task 2), Academic or General Training track, sequential unlock, AI plus examiner-style feedback, and one full Writing mock after completion.",
};

export const SPEAKING_SKILL_PLAN: PaidPlan = {
  name: "Speaking Skill",
  priceInr: 899,
  slug: SPEAKING_SKILL_SLUG,
  durationDays: 180,
  schemaDescription:
    "Focused IELTS Speaking pack — practice across Part 1, Part 2, and Part 3 with AI transcription, band-descriptor feedback, human review path, and one full Speaking mock after completion.",
};

export const DUAL_BUNDLE_PLAN: PaidPlan = {
  name: "Dual Bundle",
  priceInr: 1799,
  slug: DUAL_BUNDLE_SLUG,
  durationDays: 180,
  schemaDescription:
    "Writing and Speaking together — full Writing Skill and Speaking Skill inventory, AI plus examiner-style feedback on both production skills, and two skill mocks.",
};

/** Canonical paid plans for marketing, SEO, and checkout fallback surfaces. */
export const PAID_PLANS: PaidPlan[] = [
  WRITING_SKILL_PLAN,
  SPEAKING_SKILL_PLAN,
  DUAL_BUNDLE_PLAN,
  FULL_SKILL_PROGRAM,
];

/** @deprecated Use PAID_PLANS or FULL_SKILL_PROGRAM */
export type SprintPlan = PaidPlan;

/** @deprecated Use PAID_PLANS or FULL_SKILL_PROGRAM */
export const SPRINT_PLANS = PAID_PLANS;

export function formatPriceInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
