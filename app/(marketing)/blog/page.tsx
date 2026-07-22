import type { Metadata } from "next";
import { BlogIndexExperience } from "@/components/bandforge/seo/blog-index-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { blogCollectionSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.blog.title,
  description: PAGE_SEO_COPY.blog.description,
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
