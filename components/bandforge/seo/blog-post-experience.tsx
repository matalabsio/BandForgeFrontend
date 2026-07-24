import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfLastUpdated } from "@/components/seo/bf-last-updated";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
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
      heroCta={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={diagnosticPaths.landing}
            prefetch
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-brand-sky-hover"
          >
            Take free diagnostic
            <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
          </Link>
          <Link
            href="/blog"
            prefetch
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-white px-6 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40"
          >
            All articles
          </Link>
        </div>
      }
    >
      <section className="border-b border-border-soft bg-white bf-section">
        <div className="bf-container mx-auto max-w-3xl">
          <BfLastUpdated date={post.updatedAt} className="mb-8" />
          <article>
            {post.sections.map((section, index) => (
              <div key={section.heading ?? `section-${index}`} className="mb-8 last:mb-0">
                {section.heading ? (
                  <h2 className="font-display text-xl font-bold text-navy sm:text-2xl">
                    {section.heading}
                  </h2>
                ) : null}
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="mt-4 text-sm leading-relaxed text-[#3f4f63] sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </article>

          <div className="mt-10 flex flex-col gap-3 border-t border-border-soft pt-8 sm:flex-row sm:flex-wrap">
            <Link
              href={diagnosticPaths.landing}
              prefetch
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-brand-sky-hover"
            >
              Start free diagnostic
              <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
            </Link>
            <Link
              href="/pricing"
              prefetch
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface px-6 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40"
            >
              View pricing
            </Link>
            <Link
              href="/vs-coaching-centres"
              prefetch
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface px-6 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40"
            >
              vs Coaching centres
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted">
            <Link
              href="/blog"
              prefetch
              className="cursor-pointer font-medium text-teal no-underline hover:underline"
            >
              ← Back to blog
            </Link>
          </p>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
