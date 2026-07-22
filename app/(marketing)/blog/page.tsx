import type { Metadata } from "next";
import { BlogIndexExperience } from "@/components/bandforge/seo/blog-index-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { blogCollectionSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: "BandForge Blog — IELTS Tips for AP & TG Students",
  description:
    "IELTS preparation guides, band-score strategies, and study advice for Telugu- and Urdu-speaking students in Telangana and Andhra Pradesh.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <>
      <JsonLd data={blogCollectionSchema()} />
      <BlogIndexExperience />
    </>
  );
}
