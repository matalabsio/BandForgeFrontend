import { RETAKER_CLUSTER_KEYWORDS } from "@/lib/seo/keyword-map";

/** Static blog registry — add posts here when content is ready (Week 3+). */

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
 * Blog #1 placeholder — P3 retaker cluster (highest-intent).
 * Target keywords from keyword-map.ts; add full content when copy is ready.
 */
export const PLANNED_BLOG_POSTS: Pick<
  BlogPost,
  "slug" | "title" | "description" | "targetKeywords"
>[] = [
  {
    slug: "ielts-retake-preparation",
    title: "IELTS Retake Preparation: How to Improve Your Band Score on the Second Attempt",
    description:
      "Stuck at 6.5? Score not improving after coaching? A structured retake plan with diagnostic-first targeting for Writing and Speaking.",
    targetKeywords: RETAKER_CLUSTER_KEYWORDS.map((entry) => entry.phrase),
  },
];

export const BLOG_POSTS: BlogPost[] = [];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}
