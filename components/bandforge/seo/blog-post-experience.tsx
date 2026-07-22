import Link from "next/link";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfLastUpdated } from "@/components/seo/bf-last-updated";
import type { BlogPost } from "@/lib/seo/blog-posts";

type Props = {
  post: BlogPost;
};

export function BlogPostExperience({ post }: Props) {
  return (
    <BandForgeRouteShell
      activeHref="/blog"
      eyebrow="Blog"
      title={post.title}
      description={post.description}
      lastUpdated={post.updatedAt}
    >
      <section className="bf-section">
        <div className="bf-container max-w-3xl">
          <BfLastUpdated date={post.updatedAt} className="mb-8" />
          <article className="prose prose-slate max-w-none">
            {post.sections.map((section, index) => (
              <div key={index} className="mb-8">
                {section.heading ? (
                  <h2 className="font-display text-2xl font-semibold text-navy">
                    {section.heading}
                  </h2>
                ) : null}
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="mt-4 text-base leading-relaxed text-ink/75"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </article>
          <p className="mt-10 text-sm text-ink/60">
            <Link href="/blog" prefetch className="text-teal hover:underline">
              ← Back to blog
            </Link>
          </p>
        </div>
      </section>
    </BandForgeRouteShell>
  );
}
