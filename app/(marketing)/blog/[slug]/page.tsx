import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostExperience } from "@/components/bandforge/seo/blog-post-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllBlogSlugs, getBlogPost } from "@/lib/seo/blog-posts";
import { pageMetadata } from "@/lib/seo/metadata";
import { blogPostingSchema } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: "Post not found" };
  }

  return pageMetadata({
    title: `${post.title} | BandForge Blog`,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd data={blogPostingSchema(post)} />
      <BlogPostExperience post={post} />
    </>
  );
}

export const dynamicParams = false;
