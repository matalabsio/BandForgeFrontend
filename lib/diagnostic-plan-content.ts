export type StudyPlanWeek = {
  title: string;
  items: string[];
};

export const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";

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
  badge: "Recommended for you",
  chips: ["All 4 skills", "Exam-date paced", "Full mock unlock"],
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
