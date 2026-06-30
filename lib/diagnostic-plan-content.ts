export type StudyPlanWeek = {
  title: string;
  items: string[];
};

export type PlanBundleId =
  | "all_skills"
  | "dual_bundle"
  | "writing_sprint"
  | "speaking_sprint";

export type PlanBundle = {
  id: PlanBundleId;
  name: string;
  subtitle: string;
  price: string;
  priceNote: string;
  features: string[];
  guarantee: string;
  cta: string;
  recommended?: boolean;
  badge?: string;
  /** Compact pills on featured mobile card */
  chips?: string[];
};

export const DIAGNOSTIC_STUDY_PLAN_WEEKS: StudyPlanWeek[] = [
  {
    title: "Week 1 · Writing foundations",
    items: [
      "Task 1 report structure",
      "Cohesion & linking drills",
      "AI essay review · 2 essays",
      "Band 9 model breakdown",
    ],
  },
  {
    title: "Week 2 · Speaking fluency",
    items: [
      "Part 2 cue-card practice",
      "Fluency & hesitation drills",
      "Recorded mock · evaluated",
      "Pronunciation feedback",
    ],
  },
  {
    title: "Week 3 · Combined push",
    items: [
      "Timed Task 2 essay",
      "Speaking Part 3 depth",
      "Full mock · all skills",
      "Examiner-style scoring",
    ],
  },
];

export const DIAGNOSTIC_PLAN_BUNDLES: PlanBundle[] = [
  {
    id: "all_skills",
    name: "All Skills Bundle",
    subtitle: "All four skills · recommended",
    price: "₹2,999",
    priceNote: "one-time",
    features: [
      "All four skills covered",
      "Full mock test library",
      "Priority AI & human review",
      "Unlimited mock retakes",
    ],
    guarantee:
      "Full-band-up guarantee across all four skills, or your money back",
    cta: "Get All Skills Bundle",
    recommended: true,
    badge: "Recommended · Best Value",
    chips: ["All 4 skills", "Full mock library", "Unlimited retakes"],
  },
  {
    id: "dual_bundle",
    name: "Dual Bundle",
    subtitle: "Writing + Speaking focus",
    price: "₹1,799",
    priceNote: "one-time",
    features: [
      "Both Sprint plans in full",
      "Priority AI & human review",
      "2 full evaluated mocks",
      "Weekly progress check-ins",
    ],
    guarantee:
      "Half-band-up guarantee on both skills, or your money back",
    cta: "Choose Dual Bundle",
  },
  {
    id: "writing_sprint",
    name: "Writing Sprint",
    subtitle: "4-week focused track",
    price: "₹999",
    priceNote: "one-time",
    features: [
      "Task 1 & Task 2 mastery",
      "AI essay feedback ×8",
      "Band 9 model answers",
      "Grammar & cohesion drills",
    ],
    guarantee: "Half-band-up guarantee or your money back",
    cta: "Choose Writing",
  },
  {
    id: "speaking_sprint",
    name: "Speaking Sprint",
    subtitle: "4-week focused track",
    price: "₹999",
    priceNote: "one-time",
    features: [
      "Parts 1–3 frameworks",
      "Recorded mock evals ×4",
      "Fluency & hesitation drills",
      "Pronunciation feedback",
    ],
    guarantee: "Half-band-up guarantee or your money back",
    cta: "Choose Speaking",
  },
];

export function recommendedBundleId(
  belowTargetCount: number,
): PlanBundleId {
  if (belowTargetCount >= 3) return "all_skills";
  if (belowTargetCount >= 2) return "dual_bundle";
  return "writing_sprint";
}
