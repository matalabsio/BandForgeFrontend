import { BfPricingCard, BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { BRAND_PRICING_TIERS } from "@/lib/brand-mock-data";

const TIER_HREF: Record<string, string> = {
  free: "/diagnostic",
  starter: "/pricing",
  standard: "/pricing",
};

export function BandForgePricing() {
  return (
    <section
      id="pricing"
      className="bf-ambient scroll-mt-20 border-t border-border-soft bg-white bf-section"
    >
      <div className="bf-container">
        <div className="bf-section-head mb-6 lg:mb-[54px]">
          <BfSectionEyebrow className="mb-3">Pricing</BfSectionEyebrow>
          <BfSectionHeading>Start free, upgrade when ready</BfSectionHeading>
        </div>
        <div className="mx-auto grid max-w-5xl gap-3.5 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3 lg:gap-[22px] lg:items-start">
          {BRAND_PRICING_TIERS.map((tier) => (
            <BfPricingCard
              key={tier.id}
              id={tier.id}
              name={tier.name}
              price={tier.price}
              period={tier.period}
              description={tier.description}
              cta={tier.cta}
              href={TIER_HREF[tier.id] ?? "/pricing"}
              recommended={tier.recommended}
              variant={tier.variant}
            />
          ))}
        </div>
        <p className="mx-auto mt-7 max-w-xl px-2 text-center text-[0.8125rem] leading-relaxed text-muted-light lg:mt-[38px] lg:text-sm">
          Built by a Gold Medallist, Band 9 scorer, and 10-year IELTS trainer.
        </p>
      </div>
    </section>
  );
}
