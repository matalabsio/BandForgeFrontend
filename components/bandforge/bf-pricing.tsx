import { BfPricingCard, BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { HOMEPAGE_PRICING_TIERS } from "@/lib/seo/marketing-pricing";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function BandForgePricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-border-soft bg-white bf-section"
    >
      <div className="bf-container">
        <div className="mb-6 lg:mx-auto lg:mb-[54px] lg:max-w-3xl lg:text-center">
          <BfSectionEyebrow className="mb-3">Pricing</BfSectionEyebrow>
          <BfSectionHeading>{PAGE_SEO_COPY.pricing.h1}</BfSectionHeading>
          <p className="mt-3 text-sm leading-relaxed text-muted lg:text-base">
            {PAGE_SEO_COPY.pricing.description}
          </p>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[22px]">
          {HOMEPAGE_PRICING_TIERS.map((tier) => (
            <BfPricingCard
              key={tier.id}
              {...tier}
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
