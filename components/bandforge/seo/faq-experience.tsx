import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { FaqClient } from "@/components/bandforge/seo/faq-client";
import { FAQ_LAST_UPDATED } from "@/lib/seo/faq-content";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function FaqExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/faq"
      eyebrow="FAQ"
      title={PAGE_SEO_COPY.faq.h1}
      description={PAGE_SEO_COPY.faq.description}
      lastUpdated={FAQ_LAST_UPDATED}
      heroCta={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/diagnostic"
            prefetch
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-brand-sky-hover"
          >
            Take free diagnostic
            <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
          </Link>
          <Link
            href="/pricing"
            prefetch
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-white px-6 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40"
          >
            View pricing
          </Link>
        </div>
      }
    >
      <section className="border-b border-border-soft bg-surface pb-12 pt-2 sm:pb-14">
        <FaqClient />
      </section>

      <section className="bf-section bg-white">
        <div className="bf-container mx-auto max-w-3xl">
          <div className="rounded-[1.25rem] border border-border-soft bg-surface-alt/70 px-5 py-8 text-center sm:px-8 sm:py-10">
            <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-cyan uppercase">
              Still stuck?
            </p>
            <h2 className="font-display mt-2 text-xl font-bold text-navy sm:text-2xl">
              We&apos;re happy to help
            </h2>
            <p className="mx-auto mt-2.5 max-w-[40ch] text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
              Email support for product questions, or use the contact page for
              partnerships and press.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:support@bandforge.study"
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-navy-deep sm:w-auto"
              >
                <Mail className="size-4" aria-hidden />
                support@bandforge.study
              </a>
              <Link
                href="/contact"
                prefetch
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border-soft bg-white px-6 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40 sm:w-auto"
              >
                Contact page
                <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
              <Link
                href="/pricing"
                prefetch
                className="font-semibold text-cyan transition-colors hover:text-brand-sky-hover"
              >
                Pricing
              </Link>
              <Link
                href="/refund-policy"
                prefetch
                className="font-semibold text-cyan transition-colors hover:text-brand-sky-hover"
              >
                Refunds
              </Link>
              <Link
                href="/how-it-works"
                prefetch
                className="font-semibold text-cyan transition-colors hover:text-brand-sky-hover"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
