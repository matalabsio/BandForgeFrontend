import Link from "next/link";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfEmptyState } from "@/components/bandforge/ui/bf-empty-state";
import { BLOG_POSTS } from "@/lib/seo/blog-posts";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function BlogIndexExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/blog"
      eyebrow="Blog"
      title={PAGE_SEO_COPY.blog.h1}
      description={PAGE_SEO_COPY.blog.description}
    >
      <section className="bf-section">
        <div className="bf-container max-w-3xl">
          {BLOG_POSTS.length === 0 ? (
            <BfEmptyState
              variant="no-tests"
              title="Articles coming soon"
              description="We are preparing IELTS guides with diagnostic links and sprint recommendations. Check back soon or start with the free 15-minute diagnostic today."
              actionLabel="Take the free diagnostic"
              actionHref="/diagnostic"
            />
          ) : (
            <ul className="space-y-6">
              {BLOG_POSTS.map((post) => (
                <li key={post.slug} className="bf-min-card p-6">
                  <Link
                    href={`/blog/${post.slug}`}
                    prefetch
                    className="group block no-underline"
                  >
                    <h2 className="font-display text-xl font-semibold text-navy transition-colors group-hover:text-teal">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">
                      {post.description}
                    </p>
                    <p className="mt-3 text-meta text-ink/50">
                      Updated {post.updatedAt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </BandForgeRouteShell>
  );
}
