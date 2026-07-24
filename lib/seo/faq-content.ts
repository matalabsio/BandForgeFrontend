/** Site-wide FAQ for /faq — Playbook Section 5 (H2 questions; ≤50-word lead, detail after). */

export type FaqCategoryId =
  | "getting-started"
  | "sprints"
  | "language"
  | "scores";

export type FaqItem = {
  question: string;
  /** ≤50 words — featured snippet / FAQPage schema lead. */
  leadAnswer: string;
  /** Supporting detail shown after the lead paragraph. */
  detail?: string;
  category: FaqCategoryId;
};

export const FAQ_CATEGORIES: {
  id: FaqCategoryId | "all";
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "getting-started", label: "Getting started" },
  { id: "sprints", label: "Sprints & pricing" },
  { id: "language", label: "Language & format" },
  { id: "scores", label: "Scores & evaluation" },
];

export const FAQ_LAST_UPDATED = "22 July 2026";

export const SITE_FAQ: FaqItem[] = [
  {
    question: "What is BandForge?",
    leadAnswer:
      "BandForge is an online IELTS preparation platform built for Telugu- and Urdu-speaking students in Telangana and Andhra Pradesh.",
    detail:
      "It starts with a free 15-minute diagnostic showing section-wise band scores, followed by targeted skill sprints from ₹999 with AI practice and human evaluation.",
    category: "getting-started",
  },
  {
    question: "Is the IELTS diagnostic really free?",
    leadAnswer:
      "Yes. The 15-minute diagnostic is completely free — no payment details, no trial that converts.",
    detail:
      "You get section-wise band estimates for Writing, Speaking, Reading and Listening, and a report showing where you're losing marks.",
    category: "getting-started",
  },
  {
    question: "How accurate is the diagnostic?",
    leadAnswer:
      "The diagnostic estimates your band using the official IELTS band descriptors, with AI evaluation calibrated against human-scored samples.",
    detail:
      "It's an estimate, not an official score — but it's designed to be honest, including when the news isn't what you hoped.",
    category: "getting-started",
  },
  {
    question: "What is a skill sprint?",
    leadAnswer:
      "A focused program targeting one IELTS section: 12 structured tasks over 90 days of access, each evaluated by AI instantly and reviewed by a Band 9-trained evaluator within 48 hours.",
    detail:
      "A full mock test unlocks on completion. Writing ₹999, Speaking ₹999, Dual ₹1,799, All Skills ₹2,999.",
    category: "sprints",
  },
  {
    question: "What is the Completion Guarantee?",
    leadAnswer:
      "If you complete all 12 tasks in a sprint and your score doesn't improve, your sprint is extended free.",
    detail:
      "It exists because the sprints are built to work when the work is done — and we back that.",
    category: "sprints",
  },
  {
    question: "What is the refund policy?",
    leadAnswer:
      "Purchases are final once you access a sprint or evaluation begins — standard for digital learning products.",
    detail:
      "Refunds apply only for duplicate charges, failed payments, or total non-delivery. See our refund policy or email support@bandforge.study.",
    category: "sprints",
  },
  {
    question: "Do you teach in Telugu or Urdu?",
    leadAnswer:
      "Coaching is in English — IELTS is an English exam and immersion matters.",
    detail:
      "But the platform is built for Telugu and Urdu speakers: examples from AP, Telangana and Hyderabad, and lessons targeting the specific mistakes speakers of these languages make in IELTS.",
    category: "language",
  },
  {
    question: "Is BandForge for Academic or General Training IELTS?",
    leadAnswer:
      "BandForge focuses on IELTS Academic today — the format used for university admissions and most study-abroad routes.",
    detail:
      "General Training support is on our roadmap. Contact support@bandforge.study if you need GT prep today.",
    category: "language",
  },
  {
    question: "How is BandForge different from a coaching centre?",
    leadAnswer:
      "Coaching centres sell you a full course before anyone measures where you actually stand.",
    detail:
      "BandForge measures first — free — then sells you only the training you need, online, from ₹999, with feedback on your individual work rather than batch lectures.",
    category: "language",
  },
  {
    question: "How is my Speaking evaluated?",
    leadAnswer:
      "You record real answers to real cue cards. AI analyses fluency, pronunciation, grammar and vocabulary instantly.",
    detail:
      "A human evaluator reviews your responses and adds band-descriptor feedback. You get both perspectives.",
    category: "scores",
  },
  {
    question: "How long does it take to improve by 0.5–1 band?",
    leadAnswer:
      "It depends on your starting point and section — which is why the diagnostic comes first.",
    detail:
      "A sprint gives you 90 days of access and 12 evaluated tasks; how fast you move through them is your pace. Students working consistently typically target a 0.5 band improvement in one section within a single sprint — and the Completion Guarantee backs the format.",
    category: "scores",
  },
];

/** @deprecated Use `item.leadAnswer` directly. Kept for callers that pass a combined string. */
export function faqLeadAnswer(answer: string): string {
  const match = answer.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : answer;
}
