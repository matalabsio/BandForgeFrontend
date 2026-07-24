import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfDiagnosticCtaBand } from "@/components/seo/bf-diagnostic-cta-band";
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

function HeroCtas() {
  return (
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
        href="/faq"
        prefetch
        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-white px-6 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40"
      >
        Read FAQ
      </Link>
    </div>
  );
}

export function BlogIndexExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/blog"
      eyebrow="Blog"
      title={PAGE_SEO_COPY.blog.h1}
      description={PAGE_SEO_COPY.blog.description}
      heroCta={<HeroCtas />}
      afterHero={
        <BfDiagnosticCtaBand headline="Reading guides? Pair them with a free 15-minute band check." />
      }
    >
      <section className="bf-section bg-white">
        <div className="bf-container">
          <ul className="mx-auto grid max-w-4xl gap-4 sm:gap-5">
            {BLOG_POSTS.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  prefetch
                  className="group flex h-full cursor-pointer flex-col rounded-[1.25rem] border border-border-soft bg-surface p-5 no-underline transition-colors duration-200 hover:border-cyan/40 hover:bg-white sm:p-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.6875rem] font-semibold tracking-wide text-cyan uppercase">
                      Updated {formatDisplayDate(post.updatedAt)}
                    </p>
                    <h2 className="mt-2 font-display text-lg font-bold text-navy transition-colors group-hover:text-cyan sm:text-xl">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
                      {post.description}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-cyan lg:mt-1">
                    Read article
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
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
