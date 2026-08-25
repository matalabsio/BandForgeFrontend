/** Shared CTA styles for /pricing — cards, modal, hero. */
export const pricingCtaBaseClass =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-lg px-6 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2";

export const pricingCtaNavyClass = `${pricingCtaBaseClass} bg-navy text-white hover:bg-navy-deep`;

export const pricingCtaCyanClass = `${pricingCtaBaseClass} bg-cyan text-white hover:bg-brand-sky-hover`;

export const pricingCtaMutedClass = `${pricingCtaBaseClass} border border-border-soft bg-surface text-muted hover:border-cyan/30 hover:text-navy`;
