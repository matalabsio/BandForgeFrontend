import type { ComponentType, SVGProps } from "react";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";

export type ModuleKey = "listening" | "reading" | "writing" | "speaking";

export type ModuleIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const BRAND_MODULES: {
  key: ModuleKey;
  title: string;
  description: string;
  highlights: readonly string[];
  Icon: ModuleIcon;
  band: string | null;
}[] = [
  {
    key: "listening",
    title: "Listening",
    description: "Timed under real exam audio.",
    highlights: ["Accent recognition", "Inference", "Note completion"],
    Icon: HeadphonesIcon,
    band: null,
  },
  {
    key: "reading",
    title: "Reading",
    description: "Academic and General under the clock.",
    highlights: ["Skimming", "Matching", "Detail"],
    Icon: BookIcon,
    band: null,
  },
  {
    key: "writing",
    title: "Writing",
    description: "Task 1 & 2 on the four official criteria.",
    highlights: ["AI scoring", "Line-by-line notes", "Band criteria"],
    Icon: PencilIcon,
    band: null,
  },
  {
    key: "speaking",
    title: "Speaking",
    description: "Full responses with AI feedback.",
    highlights: ["Fluency", "Range", "Pronunciation"],
    Icon: MicIcon,
    band: null,
  },
];

export const BRAND_HOW_STEPS = [
  { n: 1, title: "Onboard", body: "Set your target band and deadline." },
  { n: 2, title: "Diagnose", body: "Take the 90-minute diagnostic." },
  { n: 3, title: "Learn", body: "Get a plan for your weak spots." },
  { n: 4, title: "Practice", body: "Drill 10,000+ exam questions." },
  { n: 5, title: "Review", body: "AI feedback on every answer." },
  { n: 6, title: "Progress", body: "Watch your band climb." },
] as const;

/** Mobile landing copy — vertical timeline variant. */
export const BRAND_HOW_STEPS_MOBILE = [
  { n: 1, title: "Onboard", body: "Tell us your target band and deadline." },
  { n: 2, title: "Diagnose", body: "Take the full 90-minute diagnostic test." },
  { n: 3, title: "Personalised Study Plan", body: "Get a plan targeting your weakest skills." },
  { n: 4, title: "Practice", body: "Drill from 10,000+ exam-grade questions." },
  { n: 5, title: "Review", body: "AI feedback on every Writing & Speaking answer." },
  { n: 6, title: "Progress", body: "Watch your band climb, test after test." },
] as const;

export type PricingTierId = "free" | "starter" | "standard";

export const BRAND_PRICING_TIERS: {
  id: PricingTierId;
  name: string;
  price: string;
  period?: string;
  description: string;
  cta: string;
  recommended?: boolean;
  variant: "outline" | "primary";
}[] = [
  {
    id: "free",
    name: "Free Diagnostic",
    price: "₹0",
    description:
      "The full 90-minute test and your four-section band report.",
    cta: "Take the test",
    variant: "outline",
  },
  {
    id: "starter",
    name: "Starter Pack",
    price: "₹1,499",
    period: "/ 30 days",
    description:
      "Full practice bank, AI Writing & Speaking review, and a 30-day study plan.",
    cta: "Get Starter Pack",
    recommended: true,
    variant: "primary",
  },
  {
    id: "standard",
    name: "Standard Plan",
    price: "₹3,499",
    period: "/ 60 days",
    description:
      "Everything in Starter, doubled — plus mock-test cycles and progress tracking.",
    cta: "Get Standard Plan",
    variant: "outline",
  },
];

export const BRAND_ONBOARDING_STEPS = [
  { id: 1, label: "Target band" },
  { id: 2, label: "Purpose" },
  { id: 3, label: "Test date" },
  { id: 4, label: "Native language" },
] as const;

export const BRAND_ONBOARDING_PURPOSES = [
  "Study abroad",
  "Work visa",
  "Immigration",
  "Professional registration",
  "Personal goal",
] as const;

export const BRAND_ONBOARDING_LANGUAGES = [
  "Telugu",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Other",
] as const;

export const BRAND_DASHBOARD_MODULE_PROGRESS: {
  key: ModuleKey;
  title: string;
  band: number | null;
  testsCompleted: number;
  totalTests: number;
  progress: number;
  nextAction: string;
  href: string;
  status?: "ai_feedback_ready" | "under_review" | null;
}[] = [
  {
    key: "listening",
    title: "Listening",
    band: 7.0,
    testsCompleted: 7,
    totalTests: 20,
    progress: 35,
    nextAction: "Continue",
    href: "/test/listening",
    status: null,
  },
  {
    key: "reading",
    title: "Reading",
    band: 6.5,
    testsCompleted: 6,
    totalTests: 20,
    progress: 28,
    nextAction: "Continue",
    href: "/test/reading",
    status: null,
  },
  {
    key: "writing",
    title: "Writing",
    band: 6.0,
    testsCompleted: 4,
    totalTests: 20,
    progress: 20,
    nextAction: "Continue",
    href: "/test/writing",
    status: "ai_feedback_ready",
  },
  {
    key: "speaking",
    title: "Speaking",
    band: 6.5,
    testsCompleted: 6,
    totalTests: 20,
    progress: 28,
    nextAction: "Begin Next Test",
    href: "/test/speaking",
    status: "under_review",
  },
];

export const BRAND_DASHBOARD_EMPTY_MODULES: {
  key: ModuleKey;
  title: string;
}[] = [
  { key: "listening", title: "Listening" },
  { key: "reading", title: "Reading" },
  { key: "writing", title: "Writing" },
  { key: "speaking", title: "Speaking" },
];

export const BRAND_TODAYS_PLAN = [
  {
    id: "1",
    module: "Reading",
    moduleKey: "reading" as ModuleKey,
    title: "Passage 2",
    subtitle: "Skimming & scanning · ~20 min",
    dateLabel: "Thu · Jun 13",
  },
  {
    id: "2",
    module: "Writing",
    moduleKey: "writing" as ModuleKey,
    title: "Task 1 Practice",
    subtitle: "Describe a chart · ~25 min",
    dateLabel: "Thu · Jun 13",
  },
] as const;

export const BRAND_PROFILE_STATS = {
  targetBand: 7.0,
  testsCompleted: 8,
  expectedBand: 6.8,
  planName: "Starter Pack",
  planDaysRemaining: 44,
} as const;

export const BRAND_PLAN_PAGE_TIERS = [
  {
    id: "free" as const,
    name: "Free Diagnostic",
    price: "₹0",
    description: "Full diagnostic test and four-section band report.",
    features: ["90-minute diagnostic", "Band report", "Module breakdown"],
    cta: "Continue free",
    variant: "outline" as const,
    recommended: false,
  },
  {
    id: "starter" as const,
    name: "Starter Pack",
    price: "₹1,499",
    period: "/ 30 days",
    description: "Practice bank, AI review, and 30-day study plan.",
    features: [
      "10,000+ practice questions",
      "AI Writing & Speaking review",
      "Personalised study plan",
      "Progress tracking",
    ],
    cta: "Get Starter Pack",
    variant: "outline" as const,
    recommended: false,
  },
  {
    id: "standard" as const,
    name: "Standard Plan",
    price: "₹3,499",
    period: "/ 60 days",
    description: "Everything in Starter, plus mock cycles and analytics.",
    features: [
      "Everything in Starter",
      "Full mock test cycles",
      "Advanced analytics",
      "Priority support",
      "WhatsApp coach access",
    ],
    cta: "Get Standard Plan",
    variant: "primary" as const,
    recommended: true,
    navy: true,
  },
];

export const BRAND_STUDY_PLAN_META = {
  daysToTest: 42,
  weekLabel: "Week 1 of 6",
  todayProgress: "3/5 today",
  weeklyFocus: "Strengthen Reading inference and Writing Task 2 structure.",
};

export const BRAND_STUDY_PLAN_WEEKS = [
  { id: "w1", label: "Week 1", active: true },
  { id: "w2", label: "Week 2", active: false },
  { id: "w3", label: "Week 3", active: false },
  { id: "w4", label: "Week 4", active: false },
  { id: "w5", label: "Week 5", active: false },
  { id: "w6", label: "Week 6", active: false },
] as const;

export const BRAND_STUDY_PLAN_DAYS = [
  {
    day: "Mon, Jun 10",
    label: "Mon",
    tasks: [
      { title: "Diagnostic review", module: "Reading", duration: "20 min", done: true },
      { title: "Listening S1–S2", module: "Listening", duration: "25 min", done: true },
    ],
    status: "done" as const,
  },
  {
    day: "Tue, Jun 11",
    label: "Tue",
    tasks: [
      { title: "Reading P1 timed", module: "Reading", duration: "30 min", done: true },
      { title: "Vocabulary set 4", module: "Vocabulary", duration: "12 min", done: false },
    ],
    status: "done" as const,
  },
  {
    day: "Wed, Jun 12",
    label: "Wed",
    tasks: [
      { title: "Writing Task 1", module: "Writing", duration: "40 min", done: false },
      { title: "Grammar drill", module: "Writing", duration: "15 min", done: false },
    ],
    status: "today" as const,
  },
  {
    day: "Thu, Jun 13",
    label: "Thu",
    tasks: [
      { title: "Speaking Part 2", module: "Speaking", duration: "20 min", done: false },
      { title: "Listening S3", module: "Listening", duration: "25 min", done: false },
    ],
    status: "pending" as const,
  },
] as const;

export const BRAND_STREAK = {
  current: 12,
  longest: 18,
  weekDays: [
    { label: "M", active: true },
    { label: "T", active: true },
    { label: "W", active: true },
    { label: "T", active: true },
    { label: "F", active: true },
    { label: "S", active: false, today: true },
    { label: "S", active: false },
  ],
  weekStats: { tests: 4, tasks: 11, studyTime: "6h 20m" },
  milestones: [
    { days: 7, label: "Week warrior", reached: true, progress: 100 },
    { days: 14, label: "Fortnight focus", reached: false, progress: 86 },
    { days: 30, label: "Monthly master", reached: false, progress: 40 },
  ],
  insight:
    "You're 2 days from your next milestone. One more practice session today keeps the streak alive.",
} as const;

export const BRAND_CONTENT_FILTERS = [
  "All",
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "Vocabulary",
] as const;

export const BRAND_CONTENT_LESSONS = [
  {
    id: "1",
    title: "Note completion under pressure",
    module: "Listening",
    duration: "18 min",
    progress: 0,
    featured: true,
  },
  {
    id: "2",
    title: "True / False / Not Given mastery",
    module: "Reading",
    duration: "22 min",
    progress: 45,
    featured: false,
  },
  {
    id: "3",
    title: "Task 2 introduction paragraphs",
    module: "Writing",
    duration: "30 min",
    progress: 0,
    featured: false,
  },
  {
    id: "4",
    title: "Fluency fillers & pacing",
    module: "Speaking",
    duration: "15 min",
    progress: 100,
    featured: false,
  },
  {
    id: "5",
    title: "Academic word list — Set 7",
    module: "Vocabulary",
    duration: "12 min",
    progress: 20,
    featured: false,
  },
  {
    id: "6",
    title: "Map labelling strategies",
    module: "Listening",
    duration: "16 min",
    progress: 0,
    featured: false,
    locked: true,
  },
] as const;

export const BRAND_DIAGNOSTIC_SECTIONS = [
  { label: "Listening", score: 7.5, width: "83%" },
  { label: "Reading", score: 7.0, width: "78%" },
  { label: "Writing", score: 6.5, width: "72%" },
  { label: "Speaking", score: 7.0, width: "78%" },
] as const;

export type AboutCredentialIcon = "star" | "medal" | "graduation" | "clock";

export const BRAND_ABOUT_CREDENTIALS: {
  icon: AboutCredentialIcon;
  value: string;
  label: string;
  mono?: boolean;
}[] = [
  { icon: "star", value: "9", label: "Band score, IELTS", mono: true },
  { icon: "medal", value: "Gold Medallist", label: "Literature in English", mono: false },
  { icon: "graduation", value: "Master of Public Policy", label: "University of Sydney", mono: false },
  { icon: "clock", value: "10+", label: "Years IELTS training", mono: true },
];

export const BRAND_ABOUT_FOUNDER_QUOTES = [
  "I know what it feels like to sit the IELTS with everything riding on it. I also know what it feels like to evaluate thousands of scripts and understand exactly why students fall short of their target band.",
  "BandForge is built on one principle — diagnosis before prescription. No generic practice. No guesswork. Just a precise understanding of where you are and a structured path to where you need to be.",
] as const;

export const BRAND_ABOUT_PILLARS = [
  {
    title: "Examiner-grade AI evaluation",
    body: "Writing and Speaking scored against the same criteria a real examiner applies — not a generic rubric.",
  },
  {
    title: "Diagnostic-first, not practice-first",
    body: "You start by knowing exactly where you stand — then practise only what moves your band.",
  },
  {
    title: "Built for South Asian English speakers",
    body: "Designed around the patterns and pitfalls of our English — not retro-fitted from a Western test-taker's.",
  },
] as const;
