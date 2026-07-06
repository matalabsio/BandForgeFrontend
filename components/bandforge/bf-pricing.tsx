import { BfPricingCard, BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { BRAND_PRICING_TIERS } from "@/lib/brand-mock-data";
import { marketingAppHref } from "@/components/bandforge/bf-marketing-auth-links";

export function BandForgePricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-border-soft bg-white bf-section"
    >
      <div className="bf-container">
        <div className="mb-6 lg:mx-auto lg:mb-[54px] lg:max-w-3xl lg:text-center">
          <BfSectionEyebrow className="mb-3">Pricing</BfSectionEyebrow>
          <BfSectionHeading>Start free, upgrade when ready</BfSectionHeading>
        </div>
        <div className="flex flex-col gap-3.5 md:grid md:grid-cols-2 lg:grid-cols-3 lg:items-start lg:gap-[22px]">
          {BRAND_PRICING_TIERS.map((tier) => (
            <BfPricingCard
              key={tier.id}
              {...tier}
              href={tier.id === "free" ? marketingAppHref() : "/pricing"}
            />
          ))}
        </div>
        <p className="mt-7 px-2 text-center text-[0.8125rem] leading-relaxed text-muted-light lg:mt-[38px] lg:text-sm">
          Built by a Gold Medallist, Band 9 scorer, and 10-year IELTS trainer.
        </p>
      </div>
    </section>
  );
}
