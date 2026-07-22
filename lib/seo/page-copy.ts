/**
 * Playbook Section 3 — page titles (≤60), meta descriptions (≤155), and H1s.
 * Single source of truth for public SEO landing copy.
 */

export type PageSeoCopy = {
  title: string;
  description: string;
  h1: string;
  /** Optional hero subcopy below H1 (not the meta description). */
  heroDescription?: string;
  /** P3-first sprint pages — long-form opening paragraph. */
  openingCopy?: string;
};

export const PAGE_SEO_COPY = {
  home: {
    title: "BandForge — IELTS Prep for Telugu & Urdu Speakers",
    description:
      "Find your real IELTS band in a free 15-minute diagnostic. Section-wise scores, targeted skill sprints from ₹999. Built in Hyderabad for AP & TG students.",
    h1: "Know your real IELTS band — before exam day.",
    heroDescription:
      "A free diagnostic that tells you exactly where you stand — across all four sections — in 15 minutes.",
  },
  diagnostic: {
    title: "Free IELTS Diagnostic Test — 15 Minutes | BandForge",
    description:
      "A free 15-minute IELTS diagnostic that shows your section-wise band — Writing, Speaking, Reading, Listening. Instant results. No payment, no spam.",
    h1: "Your real IELTS band, in 15 minutes. Free.",
  },
  writing: {
    title: "IELTS Writing Sprint — Band 9 Feedback in 48 Hrs | ₹999",
    description:
      "12 evaluated Writing tasks over 90 days. Band 9 trainer feedback within 48 hours, Completion Guarantee. ₹999. Free diagnostic finds your leak first.",
    h1: "The IELTS Writing Sprint — fix the section that's costing you",
    openingCopy:
      "Stuck at Writing 6 while everything else is 7? You don't need another full course — you need the one criterion that's leaking marks, found and fixed. The free diagnostic locates it. The Writing Sprint targets it: 12 structured tasks across every Task 1 and Task 2 format, each evaluated by AI instantly and reviewed by a Band 9-trained evaluator within 48 hours, over 90 days of access, with a full mock test unlocked on completion — and a Completion Guarantee: finish all 12 tasks with no score improvement and your sprint is extended free.",
  },
  speaking: {
    title: "IELTS Speaking Sprint — AI + Band 9 Review | ₹999",
    description:
      "12 recorded Speaking tasks over 90 days — every IELTS part covered. AI + Band 9-trained human review in 48 hrs. Completion Guarantee. ₹999.",
    h1: "The IELTS Speaking Sprint — real answers, real evaluation",
    openingCopy:
      "Fluent with friends, Band 6 with examiners? The gap is scored criteria — fluency, vocabulary, grammar, pronunciation — not confidence. The Speaking Sprint has you record real answers across Parts 1, 2 and 3: AI transcribes and evaluates instantly; a Band 9-trained specialist reviews within 48 hours and tells you exactly what to change. 12 tasks, 90 days of access, mock test on completion, Completion Guarantee. Built around the errors Telugu and Urdu speakers actually make.",
  },
  pricing: {
    title: "BandForge Pricing — IELTS Sprints From ₹999",
    description:
      "Writing ₹999 · Speaking ₹999 · Dual ₹1,799 · All Skills ₹2,999. Free diagnostic first, always. No lock-ins, no coaching-centre fees.",
    h1: "Simple pricing. Diagnostic always free.",
  },
  telugu: {
    title: "IELTS for Telugu Speakers — Coaching Built for You",
    description:
      "IELTS prep designed for Telugu-speaking students. English coaching, Telugu context — mistakes Telugu speakers actually make, fixed. Free diagnostic.",
    h1: "IELTS, built for Telugu speakers.",
  },
  urdu: {
    title: "IELTS for Urdu Speakers — Hyderabad's Own Platform",
    description:
      "IELTS prep for Urdu-speaking students in Hyderabad and beyond. UK, Canada, US routes. Free 15-minute diagnostic, sprints from ₹999.",
    h1: "IELTS, built for Urdu speakers.",
  },
  hyderabad: {
    title: "IELTS Coaching in Hyderabad — Online | BandForge",
    description:
      "Hyderabad-built online IELTS coaching. Skip the Ameerpet queues — free diagnostic, section-wise scores, sprints from ₹999. Gachibowli-based team.",
    h1: "IELTS coaching in Hyderabad, without the commute.",
  },
  faq: {
    title: "BandForge FAQ — Diagnostic, Sprints, Pricing",
    description:
      "Everything about the free IELTS diagnostic, skill sprints, evaluation, pricing and languages — answered.",
    h1: "Frequently asked questions",
  },
  vsCoachingCentres: {
    title: "BandForge vs IELTS Coaching Centres — Honest Comparison",
    description:
      "Coaching centre, big-brand prep, or BandForge? An honest comparison of cost, feedback quality, and time — so you choose what fits.",
    h1: "BandForge vs traditional IELTS coaching: an honest comparison",
  },
  blog: {
    title: "BandForge Blog — IELTS Tips for AP & TG Students",
    description:
      "IELTS preparation guides, band-score strategies, and study advice for Telugu- and Urdu-speaking students in Telangana and Andhra Pradesh.",
    h1: "IELTS guides for Telugu and Urdu speakers.",
  },
} as const satisfies Record<string, PageSeoCopy>;

/** ≤50-word AEO lead for Writing Sprint (derived from opening copy). */
export const WRITING_SPRINT_LEAD_ANSWER =
  "Stuck at Writing 6 while everything else is 7? The free diagnostic locates your leak; the Writing Sprint fixes it with 12 tasks, Band 9 review in 48 hours, and a Completion Guarantee.";

/** ≤50-word AEO lead for Speaking Sprint (derived from opening copy). */
export const SPEAKING_SPRINT_LEAD_ANSWER =
  "Fluent with friends, Band 6 with examiners? The Speaking Sprint records real answers across Parts 1–3 with AI plus Band 9 human review in 48 hours.";
