import { BfHeroActions } from "@/components/bandforge/bf-hero-actions";
import { BfHeroAntigravity } from "@/components/bandforge/bf-hero-antigravity";
import { BfSectionEyebrow } from "@/components/bandforge/ui";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function BandForgeHero() {
  return (
    <section
      className="bf-ambient relative flex min-h-[90dvh] items-center overflow-hidden bg-surface bf-section !pt-[64px] sm:!pt-[72px] lg:min-h-dvh lg:!pt-[6.75rem]"
      aria-labelledby="bf-hero-heading"
    >
      <BfHeroAntigravity />

      <div className="bf-container pointer-events-none relative z-10 pb-8 sm:pb-12 lg:pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <BfSectionEyebrow className="bf-hero-text mb-4 sm:mb-5 lg:mb-6">
            IELTS Diagnostic · 90 minutes
          </BfSectionEyebrow>
          <h1
            id="bf-hero-heading"
            className="bf-hero-title bf-delay-1 font-display mb-4 text-[1.75rem] leading-[1.12] font-bold tracking-[-0.03em] text-balance text-navy sm:mb-[18px] sm:text-[2.125rem] sm:leading-[1.08] lg:mb-6 lg:text-[3.5rem] lg:tracking-[-0.035em]"
          >
            {PAGE_SEO_COPY.home.h1}
          </h1>
          <p className="bf-hero-text bf-delay-2 mx-auto mb-0 max-w-[46ch] text-[0.9375rem] leading-[1.6] text-muted sm:text-base lg:text-[1.1875rem]">
            {PAGE_SEO_COPY.home.heroDescription}
          </p>
          <div className="bf-hero-text bf-delay-3">
            <BfHeroActions />
          </div>
        </div>
      </div>
    </section>
  );
}
