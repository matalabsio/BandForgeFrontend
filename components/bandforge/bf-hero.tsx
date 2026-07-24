import { BfHeroActions } from "@/components/bandforge/bf-hero-actions";
import { BfHeroAntigravity } from "@/components/bandforge/bf-hero-antigravity";
import CircularText from "@/components/bandforge/circular-text";
import { BfSectionEyebrow } from "@/components/bandforge/ui";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function BandForgeHero() {
  return (
    <section
      className="bf-ambient bf-ambient-from-top relative flex min-h-[calc(100dvh-4.75rem)] flex-col overflow-hidden bg-surface !pt-0 !pb-5 sm:!pb-8 lg:min-h-dvh lg:-mt-[4.75rem] lg:!pt-[4.75rem] lg:!pb-16"
      aria-labelledby="bf-hero-heading"
    >
      <BfHeroAntigravity />

      {/* Desktop top band — below sticky nav */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(4.75rem+5px)] z-20 hidden lg:block">
        <div className="relative mx-auto flex min-h-[108px] w-full max-w-[1200px] items-start px-10">
          <BfSectionEyebrow className="bf-hero-text absolute top-1.5 left-1/2 z-10 w-max -translate-x-1/2 rounded-full border border-cyan/20 bg-cyan-soft/80 px-4 py-2 text-center shadow-[0_1px_2px_rgb(0_151_167/0.06)] backdrop-blur-[6px]">
            IELTS Diagnostic · 90 minutes
          </BfSectionEyebrow>

          <div className="ml-auto flex items-start" aria-hidden>
            <div className="invisible flex items-center gap-7 text-[0.9375rem] font-medium">
              <span className="inline-flex items-center gap-2">
                <span className="size-4 shrink-0" />
                Pricing
              </span>
            </div>
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
        </div>
      </div>

      {/* Mobile / tablet circular loop */}
      <div className="pointer-events-auto absolute top-[12px] right-[calc(1rem+24px-10px-30px-30px)] z-30 origin-top-right scale-[0.78] sm:right-[calc(2em+28px-10px-30px-30px)] sm:scale-[0.82] lg:hidden">
        <div className="-translate-x-1/2">
          <CircularText
            text="BUILT BY A GOLD MEDALLIST • "
            onHover="speedUp"
            spinDuration={22}
            className="text-navy"
          />
        </div>
      </div>

      {/*
        Mobile stack (100vh): eyebrow + title → avatar mid → copy → CTA bottom
        Desktop: centered copy column under nav band
      */}
      <div className="bf-container pointer-events-none relative z-20 flex w-full flex-1 flex-col lg:block lg:flex-none lg:pt-[7.25rem]">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col text-center lg:block lg:flex-none">
          {/* Top: eyebrow + headline */}
          <div className="flex shrink-0 flex-col items-center px-1 pt-12 sm:pt-14 lg:block lg:pt-0">
            <BfSectionEyebrow className="bf-hero-text mb-2.5 inline-flex w-max max-w-[min(100%,17.5rem)] rounded-full border border-cyan/20 bg-cyan-soft/80 px-3.5 py-1.5 text-center shadow-[0_1px_2px_rgb(0_151_167/0.06)] backdrop-blur-[6px] sm:mb-3.5 sm:max-w-none sm:px-4 sm:py-2 lg:hidden">
              IELTS Diagnostic · 90 minutes
            </BfSectionEyebrow>

            <h1
              id="bf-hero-heading"
              className="bf-hero-title bf-delay-1 relative z-20 font-display mb-0 max-w-[18.5ch] pr-2 text-[1.5rem] leading-[1.26] font-bold tracking-[-0.03em] text-balance text-navy sm:max-w-none sm:pr-0 sm:text-[2.125rem] sm:leading-[1.24] lg:mb-5 lg:max-w-none lg:text-[3.5rem] lg:leading-[1.18] lg:tracking-[-0.035em]"
            >
              {PAGE_SEO_COPY.home.h1}
            </h1>
          </div>

          {/* Mid: avatar (mobile) */}
          <div className="bf-hero-text bf-delay-2 flex min-h-0 flex-1 items-center justify-center py-4 lg:hidden">
            <div
              className="relative flex size-[6.75rem] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#e8f7f9_0%,#ffffff_55%,#e0f7fa_100%)] shadow-[0_14px_32px_-14px_rgb(0_151_167/0.4)] ring-2 ring-[#c9a227]/50 ring-offset-2 ring-offset-surface sm:size-[8rem]"
              aria-hidden
            >
              <svg
                viewBox="0 0 80 80"
                className="size-[3.75rem] text-navy/50 sm:size-[4.5rem]"
                fill="currentColor"
              >
                <circle cx="40" cy="28" r="14" />
                <path d="M12 70c0-15.5 12.5-28 28-28s28 12.5 28 28" />
              </svg>
              <span className="absolute right-0.5 bottom-0.5 flex size-6 items-center justify-center rounded-full bg-[#c9a227] text-[0.5625rem] font-bold text-white shadow-sm sm:size-7 sm:text-[0.625rem]">
                ★
              </span>
            </div>
          </div>

          {/* Copy + CTA */}
          <div className="flex w-full shrink-0 flex-col items-center gap-5 pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:gap-6 lg:gap-0 lg:pb-0">
            <p className="bf-hero-text bf-delay-2 relative z-20 mx-auto mb-0 max-w-[40ch] px-1 text-[0.875rem] leading-[1.6] text-muted sm:max-w-[46ch] sm:text-base sm:leading-[1.75] lg:text-[1.1875rem] lg:leading-[1.75]">
              {PAGE_SEO_COPY.home.heroDescription}
            </p>

            <div className="bf-hero-text bf-delay-3 w-full lg:mt-8">
              <BfHeroActions />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
