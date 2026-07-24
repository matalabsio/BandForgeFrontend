import { BfHeroActions } from "@/components/bandforge/bf-hero-actions";
import { BfHeroAntigravity } from "@/components/bandforge/bf-hero-antigravity";
import CircularText from "@/components/bandforge/circular-text";
import { BfSectionEyebrow } from "@/components/bandforge/ui";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function BandForgeHero() {
  return (
    <section
      className="bf-ambient relative flex min-h-[90dvh] items-start overflow-hidden bg-surface !pt-0 !pb-10 sm:!pb-12 lg:min-h-dvh lg:!pb-16"
      aria-labelledby="bf-hero-heading"
    >
      <BfHeroAntigravity />

      {/* Top band ~5–10px under nav — circle centered on Pricing↔Dashboard gap, +10px right */}
      <div className="pointer-events-none absolute inset-x-0 top-[5px] z-20">
        <div className="relative mx-auto flex min-h-[9.75rem] w-full max-w-[1200px] items-start px-4 sm:min-h-[10.5rem] sm:px-5 lg:min-h-[108px] lg:px-10">
          {/* Mobile/tablet: eyebrow below circle so they don’t collide. Desktop: beside circle. */}
          <BfSectionEyebrow className="bf-hero-text absolute top-[5.5rem] left-1/2 z-10 w-max max-w-[min(100%,20rem)] -translate-x-1/2 rounded-full border border-cyan/20 bg-cyan-soft/80 px-3.5 py-1.5 text-center shadow-[0_1px_2px_rgb(0_151_167/0.06)] backdrop-blur-[6px] sm:top-[6.25rem] sm:max-w-none sm:px-4 sm:py-2 lg:top-1.5">
            IELTS Diagnostic · 90 minutes
          </BfSectionEyebrow>

          {/* Invisible mirror of nav right cluster so circle lines up with Pricing | Dashboard */}
          <div
            className="ml-auto hidden items-start lg:flex"
            aria-hidden
          >
            <div className="invisible flex items-center gap-7 text-[0.9375rem] font-medium">
              <span className="inline-flex items-center gap-2">
                <span className="size-4 shrink-0" />
                Pricing
              </span>
            </div>
            {/* gap-6 matches header between nav and Dashboard */}
            <div className="relative w-6 shrink-0">
              <div className="pointer-events-auto absolute top-0 left-1/2 translate-x-[calc(-50%+10px)]">
                <CircularText
                  text="BUILT BY A GOLD MEDALLIST • "
                  onHover="speedUp"
                  spinDuration={22}
                  className="text-navy"
                />
              </div>
            </div>
            <span className="invisible inline-flex min-h-10 items-center justify-center rounded-full px-[22px] py-2.5 text-[0.9375rem] font-semibold whitespace-nowrap">
              Dashboard
            </span>
          </div>

          {/* Mobile / tablet — under hamburger; +30px right, +15px down from base */}
          <div className="pointer-events-auto absolute top-[15px] right-[calc(1rem+24px-10px-30px)] origin-top-right scale-[0.78] sm:right-[calc(2em+28px-10px-30px)] sm:scale-[0.82] lg:hidden">
            <div className="-translate-x-1/2">
              <CircularText
                text="BUILT BY A GOLD MEDALLIST • "
                onHover="speedUp"
                spinDuration={22}
                className="text-navy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copy sits just under the circle / eyebrow band */}
      <div className="bf-container pointer-events-none relative z-10 w-full pt-[11.25rem] sm:pt-[12.25rem] lg:pt-[7.25rem]">
        <div className="mx-auto max-w-2xl text-center">
          <h1
            id="bf-hero-heading"
            className="bf-hero-title bf-delay-1 font-display mb-4 text-[1.625rem] leading-[1.28] font-bold tracking-[-0.03em] text-balance text-navy sm:mb-[18px] sm:text-[2.125rem] sm:leading-[1.24] lg:mb-6 lg:text-[3.5rem] lg:leading-[1.18] lg:tracking-[-0.035em]"
          >
            {PAGE_SEO_COPY.home.h1}
          </h1>
          <p className="bf-hero-text bf-delay-2 mx-auto mb-0 max-w-[46ch] text-[0.9375rem] leading-[1.75] text-muted sm:text-base sm:leading-[1.8] lg:text-[1.1875rem] lg:leading-[1.75]">
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
