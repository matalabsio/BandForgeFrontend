import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  FREE_DIAGNOSTIC_TIER,
  HOMEPAGE_PRICING_TIERS,
} from "@/lib/seo/marketing-pricing";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

/** Crawler-visible pricing hero + free diagnostic — sprint cards live in PricingClient. */
export function PricingStaticOverview() {
  const sprintTiers = HOMEPAGE_PRICING_TIERS.filter(
    (tier) => tier.id !== FREE_DIAGNOSTIC_TIER.id,
  );

  return (
    <section className="bf-ambient relative overflow-hidden border-b border-border-soft bg-surface">
      <div className="bf-container relative z-10 mx-auto max-w-[1120px] px-5 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16 lg:px-10 lg:pb-14 lg:pt-[4.5rem]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.16em] text-cyan uppercase lg:text-xs">
            Plans &amp; pricing
          </p>
          <h1 className="font-display mt-3 text-[1.875rem] leading-[1.12] font-bold tracking-[-0.03em] text-balance text-navy sm:text-[2.375rem] lg:text-[3rem] lg:tracking-[-0.035em]">
            {PAGE_SEO_COPY.pricing.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-[42ch] text-[0.9375rem] leading-relaxed text-muted sm:text-base lg:text-[1.0625rem]">
            {PAGE_SEO_COPY.pricing.description}
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-stretch gap-4 rounded-[1.25rem] border border-cyan/25 bg-white p-5 shadow-[0_16px_40px_-28px_rgb(0_151_167/0.35)] sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6 lg:p-7">
          <div className="min-w-0 text-center sm:text-left">
            <p className="font-mono text-[0.625rem] font-semibold tracking-[0.14em] text-cyan uppercase">
              Always free
            </p>
            <p className="font-display mt-1.5 text-lg font-bold text-navy sm:text-xl">
              {FREE_DIAGNOSTIC_TIER.name} — {FREE_DIAGNOSTIC_TIER.price}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {FREE_DIAGNOSTIC_TIER.description}
            </p>
          </div>
          <Link
            href={FREE_DIAGNOSTIC_TIER.href}
            prefetch
            className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-brand-sky-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2"
          >
            {FREE_DIAGNOSTIC_TIER.cta}
            <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>

        {/* Compact crawler-visible price strip — not duplicate full cards */}
        <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-4 sm:gap-3">
          {sprintTiers.map((tier) => (
            <li key={tier.id}>
              <a
                href="#plans"
                className="flex h-full cursor-pointer flex-col items-center rounded-xl border border-border-soft bg-white/80 px-2 py-3 text-center no-underline transition-colors duration-200 hover:border-cyan/40 hover:bg-white sm:px-3 sm:py-3.5"
              >
                <span className="font-display text-[0.8125rem] font-semibold text-navy sm:text-sm">
                  {tier.name.replace(" Sprint", "")}
                </span>
                <span className="mt-1 font-mono text-sm font-bold text-cyan sm:text-base">
                  {tier.price}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
