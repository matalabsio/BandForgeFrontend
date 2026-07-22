/** Playbook Section 8 — canonical product claims (keep in sync sitewide). */

export const DIAGNOSTIC_DURATION_MINUTES = 15;
export const SPRINT_ACCESS_DAYS = 90;
export const SPRINT_TASK_COUNT = 12;
export const SPRINT_MOCK_COUNT = 1;
export const HUMAN_REVIEW_SLA = "within 48 hours";

export const OPERATOR_NAME = "MATA Labs OPC Private Limited";
export const OPERATOR_LOCATION = "Hyderabad, Telangana, India";

export type SprintPlan = {
  name: string;
  priceInr: number;
  slug: string;
  schemaDescription: string;
};

export const SPRINT_PLANS: SprintPlan[] = [
  {
    name: "Writing Sprint",
    priceInr: 999,
    slug: "writing-sprint",
    schemaDescription:
      "90-day IELTS Writing sprint with 12 tasks, AI practice, and Band 9-trained human review within 48 hours. Free diagnostic included.",
  },
  {
    name: "Speaking Sprint",
    priceInr: 999,
    slug: "speaking-sprint",
    schemaDescription:
      "90-day IELTS Speaking sprint with 12 tasks, AI practice, and Band 9-trained human review within 48 hours. Free diagnostic included.",
  },
  {
    name: "Dual Sprint",
    priceInr: 1799,
    slug: "dual-sprint",
    schemaDescription:
      "90-day IELTS Writing and Speaking dual sprint with 12 tasks, AI practice, and Band 9-trained human review within 48 hours.",
  },
  {
    name: "All Skills Sprint",
    priceInr: 2999,
    slug: "all-skills-sprint",
    schemaDescription:
      "90-day all-skills IELTS sprint covering Listening, Reading, Writing, and Speaking. AI practice plus Band 9-trained human review within 48 hours.",
  },
];

export function formatPriceInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
