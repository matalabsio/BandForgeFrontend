import { RETAKER_CLUSTER_KEYWORDS } from "@/lib/seo/keyword-map";

/** Static blog registry — add posts here when content is ready. */

export type BlogPostSection = {
  heading?: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  /** Playbook Section 2 phrases this post targets. */
  targetKeywords?: string[];
  sections: BlogPostSection[];
};

/**
 * Planned posts (not yet published) — keep for SEO roadmap visibility.
 */
export const PLANNED_BLOG_POSTS: Pick<
  BlogPost,
  "slug" | "title" | "description" | "targetKeywords"
>[] = [];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ielts-retake-preparation",
    title:
      "IELTS Retake Preparation: How to Improve Your Band Score on the Second Attempt",
    description:
      "Stuck at 6.5? Score not improving after coaching? A structured retake plan with diagnostic-first targeting for Writing and Speaking.",
    publishedAt: "2026-07-20",
    updatedAt: "2026-07-20",
    targetKeywords: RETAKER_CLUSTER_KEYWORDS.map((entry) => entry.phrase),
    sections: [
      {
        paragraphs: [
          "If you are preparing for an IELTS retake, the biggest risk is repeating the same practice loop that got you a 6.0 or 6.5 the first time. More mocks alone rarely move Writing and Speaking. You need a clear baseline, a skill that is actually blocking your overall band, and feedback timed to the criteria examiners use.",
          "This guide walks through a retake plan you can start today — including a free section-wise diagnostic before you pay for another coaching package.",
        ],
      },
      {
        heading: "Why retake scores often stall",
        paragraphs: [
          "Many students retake within weeks of a disappointing result and keep drilling full tests. That burns stamina without fixing Task Response, Coherence, Lexical Resource, or Grammatical Range — the Writing criteria — or Fluency, Lexical Resource, Grammar, and Pronunciation in Speaking.",
          "Coaching centres may restart the same batch syllabus. Online prep that only scores Listening and Reading with AI can leave the two human-marked skills under-served. A second attempt works best when you diagnose which section is holding the overall band, then sprint on that skill.",
        ],
      },
      {
        heading: "Step 1: Get a section-wise baseline (free)",
        paragraphs: [
          "Before you book another exam date, take a short diagnostic that reports Listening, Reading, Writing, and Speaking separately. BandForge’s free 15-minute diagnostic does exactly that — no payment required.",
          "Use the scores to decide: Do you need a Writing sprint, a Speaking sprint, Dual (both productive skills), or All Skills? Guessing from overall band alone wastes money and time.",
        ],
      },
      {
        heading: "Step 2: Target the skill that blocks your overall band",
        paragraphs: [
          "University and visa thresholds are usually overall bands with minimums per skill. If Writing is 5.5 and the rest are 7.0, another full-course classroom may not be the fastest path. A 12-task Writing sprint with Band 9-trained human review within 48 hours is built for that gap.",
          "If Speaking is the weak skill, practise under timed conditions and get human feedback on fluency and lexical range — not only self-recording without criteria-linked notes.",
        ],
      },
      {
        heading: "Step 3: Structure 4–8 weeks, not endless mocks",
        paragraphs: [
          "A practical retake window: complete your sprint tasks (90 days access on BandForge plans), submit Writing/Speaking for human review, then unlock the included full mock when all 12 tasks are done. Use that mock as a dress rehearsal — not as week-one busywork.",
          "Protect Listening and Reading with short daily practice, but spend most of your limited hours on the productive skill that failed last time.",
        ],
      },
      {
        heading: "When a coaching centre still makes sense",
        paragraphs: [
          "Choose an in-person centre if you need daily accountability, peer pressure, or a quiet place to study. Choose BandForge if you already know your weak skill, need flexible mobile practice, and want to verify your band before spending ₹15,000–₹40,000+ on a long package.",
          "Either way, start with a free diagnostic so you are not paying for content you do not need.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Take the free diagnostic, read your section-wise bands, then pick Writing, Speaking, Dual, or All Skills on the pricing page. If you are comparing options, see our honest comparison of BandForge vs coaching centres.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}
