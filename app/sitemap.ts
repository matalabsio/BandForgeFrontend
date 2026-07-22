import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/seo/blog-posts";
import { siteUrl } from "@/lib/site";

const LIVE_PATHS: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/diagnostic", changeFrequency: "weekly", priority: 0.95 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/writing", changeFrequency: "weekly", priority: 0.85 },
  { path: "/speaking", changeFrequency: "weekly", priority: 0.85 },
  { path: "/telugu", changeFrequency: "monthly", priority: 0.8 },
  { path: "/urdu", changeFrequency: "monthly", priority: 0.8 },
  { path: "/hyderabad", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.75 },
  { path: "/vs-coaching-centres", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ai-feedback", changeFrequency: "monthly", priority: 0.8 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { path: "/why", changeFrequency: "monthly", priority: 0.7 },
  { path: "/mobile", changeFrequency: "monthly", priority: 0.6 },
  { path: "/stories", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demo", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const blogSlugs = getAllBlogSlugs().map((slug) => ({
    path: `/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...LIVE_PATHS, ...blogSlugs].map(({ path, changeFrequency, priority }) => ({
    url: siteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
