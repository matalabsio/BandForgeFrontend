import Link from "next/link";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfLastUpdated } from "@/components/seo/bf-last-updated";
import { SeoPrimaryCta } from "@/components/seo/seo-cta-button";
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
        <SeoPrimaryCta href={diagnosticPaths.landing}>
          Take free diagnostic
        </SeoPrimaryCta>
      }
    >
      <section className="border-b border-border-soft bg-white py-10 sm:py-12 lg:py-16">
        <div className="bf-container mx-auto max-w-2xl">
          <BfLastUpdated date={post.updatedAt} className="mb-6" />
          <article>
            {post.sections.map((section, index) => (
              <div key={section.heading ?? `section-${index}`} className="mb-7 last:mb-0">
                {section.heading ? (
                  <h2 className="font-display text-lg font-bold text-navy sm:text-xl">
                    {section.heading}
                  </h2>
                ) : null}
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="mt-3 text-sm leading-relaxed text-[#3f4f63] sm:text-[0.9375rem]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </article>

          <p className="mt-8 border-t border-border-soft pt-6 text-sm text-muted">
            <Link
              href="/blog"
              prefetch
              className="cursor-pointer font-medium text-[#0097a7] no-underline hover:text-[#00bcd4]"
            >
              ← All articles
            </Link>
          </p>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
