import Link from "next/link";
import {
  FREE_DIAGNOSTIC_TIER,
  HOMEPAGE_PRICING_TIERS,
} from "@/lib/seo/marketing-pricing";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

/** Crawler-visible sprint pricing — complements client checkout UI. */
export function PricingStaticOverview() {
  const sprintTiers = HOMEPAGE_PRICING_TIERS.filter(
    (tier) => tier.id !== FREE_DIAGNOSTIC_TIER.id,
  );

  return (
    <section className="bf-container mx-auto max-w-[1100px] px-4 pb-4 pt-10 sm:pt-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
          Plans &amp; pricing
        </p>
        <h1 className="font-display mt-2 text-3xl font-extrabold text-navy sm:text-4xl">
          {PAGE_SEO_COPY.pricing.h1}
        </h1>
        <p className="mt-3 text-sm text-muted">{PAGE_SEO_COPY.pricing.description}</p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border-soft bg-surface px-5 py-5">
        <p className="font-display text-base font-bold text-navy">
          {FREE_DIAGNOSTIC_TIER.name} — {FREE_DIAGNOSTIC_TIER.price}
        </p>
        <p className="mt-1 text-sm text-muted">{FREE_DIAGNOSTIC_TIER.description}</p>
        <Link href={FREE_DIAGNOSTIC_TIER.href} prefetch className="mt-3 inline-flex text-sm font-semibold text-cyan">
          {FREE_DIAGNOSTIC_TIER.cta} →
        </Link>
      </div>

      <ul className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sprintTiers.map((tier) => (
          <li
            key={tier.id}
            className="rounded-2xl border border-border-soft bg-white p-5"
          >
            <h2 className="font-display text-base font-bold text-navy">{tier.name}</h2>
            <p className="mt-1 font-mono text-xl font-semibold text-navy">
              {tier.price}
              {tier.period ? (
                <span className="text-xs font-normal text-muted-light"> {tier.period}</span>
              ) : null}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{tier.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
