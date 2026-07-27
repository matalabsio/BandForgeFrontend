import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { SeoPrimaryCta } from "@/components/seo/seo-cta-button";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { BLOG_POSTS } from "@/lib/seo/blog-posts";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

function formatDisplayDate(isoDate: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${isoDate}T00:00:00`));
  } catch {
    return isoDate;
  }
}

export function BlogIndexExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/blog"
      eyebrow="Blog"
      title={PAGE_SEO_COPY.blog.h1}
      description={PAGE_SEO_COPY.blog.description}
      heroCta={
        <SeoPrimaryCta href={diagnosticPaths.landing}>
          Take free diagnostic
        </SeoPrimaryCta>
      }
    >
      <section className="bg-white py-10 sm:py-12 lg:py-16">
        <div className="bf-container mx-auto max-w-2xl">
          <ul className="divide-y divide-border-soft border-y border-border-soft">
            {BLOG_POSTS.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  prefetch
                  className="group flex cursor-pointer flex-col gap-2 py-5 no-underline sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:py-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.6875rem] font-semibold tracking-wide text-cyan uppercase">
                      {formatDisplayDate(post.updatedAt)}
                    </p>
                    <h2 className="mt-1.5 font-display text-base font-bold text-navy transition-colors group-hover:text-[#0097a7] sm:text-lg">
                      {post.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {post.description}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0097a7]">
                    Read
                    <ArrowRight
                      className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
