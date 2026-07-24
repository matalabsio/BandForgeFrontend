import { BfHeroActions } from "@/components/bandforge/bf-hero-actions";
import { BfHeroAntigravity } from "@/components/bandforge/bf-hero-antigravity";
import CircularText from "@/components/bandforge/circular-text";
import { BfSectionEyebrow } from "@/components/bandforge/ui";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function BandForgeHero() {
  return (
    <section
      className="bf-ambient bf-ambient-from-top relative flex min-h-[calc(100dvh-4.75rem)] flex-col overflow-hidden bg-surface !pt-0 !pb-6 sm:!pb-8 lg:min-h-dvh lg:-mt-[4.75rem] lg:!pt-[4.75rem] lg:!pb-16"
      aria-labelledby="bf-hero-heading"
    >
      <BfHeroAntigravity />

      {/* Desktop top band — below sticky nav (hero pulls under nav for gradient only) */}
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

      {/* Mobile / tablet circular loop — +30px further right */}
      <div className="pointer-events-auto absolute top-[15px] right-[calc(1rem+24px-10px-30px-30px)] z-20 origin-top-right scale-[0.78] sm:right-[calc(2em+28px-10px-30px-30px)] sm:scale-[0.82] lg:hidden">
        <div className="-translate-x-1/2">
          <CircularText
            text="BUILT BY A GOLD MEDALLIST • "
            onHover="speedUp"
            spinDuration={22}
            className="text-navy"
          />
        </div>
      </div>

      <div className="bf-container pointer-events-none relative z-10 flex w-full flex-1 flex-col lg:block lg:flex-none lg:pt-[7.25rem]">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col text-center lg:block lg:flex-none">
          {/* Text — a bit higher on small screens; pad clears circular loop */}
          <div className="flex shrink-0 flex-col justify-start px-1 pt-14 pb-2 sm:pt-16 lg:block lg:pt-0 lg:pb-0">
            <BfSectionEyebrow className="bf-hero-text mb-3 inline-flex w-max max-w-[min(100%,18rem)] self-center rounded-full border border-cyan/20 bg-cyan-soft/80 px-3.5 py-1.5 text-center shadow-[0_1px_2px_rgb(0_151_167/0.06)] backdrop-blur-[6px] sm:mb-4 sm:max-w-none sm:px-4 sm:py-2 lg:hidden">
              IELTS Diagnostic · 90 minutes
            </BfSectionEyebrow>
            <h1
              id="bf-hero-heading"
              className="bf-hero-title bf-delay-1 font-display mb-3 text-[1.625rem] leading-[1.28] font-bold tracking-[-0.03em] text-balance text-navy sm:mb-[18px] sm:text-[2.125rem] sm:leading-[1.24] lg:mb-6 lg:text-[3.5rem] lg:leading-[1.18] lg:tracking-[-0.035em]"
            >
              {PAGE_SEO_COPY.home.h1}
            </h1>
            <p className="bf-hero-text bf-delay-2 mx-auto mb-0 max-w-[46ch] text-[0.9375rem] leading-[1.65] text-muted sm:text-base sm:leading-[1.8] lg:text-[1.1875rem] lg:leading-[1.75]">
              {PAGE_SEO_COPY.home.heroDescription}
            </p>
          </div>
          {/* Mid-screen dummy avatar — mobile / tablet only */}
          <div className="bf-hero-text bf-delay-2 flex min-h-0 flex-1 items-center justify-center py-2 lg:hidden">
            <div
              className="relative flex size-[7.5rem] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#e8f7f9_0%,#ffffff_55%,#e0f7fa_100%)] shadow-[0_16px_36px_-16px_rgb(0_151_167/0.4)] ring-2 ring-[#c9a227]/45 ring-offset-2 ring-offset-surface sm:size-[8.75rem]"
              aria-hidden
            >
              <svg
                viewBox="0 0 80 80"
                className="size-[4.25rem] text-navy/55 sm:size-[5rem]"
                fill="currentColor"
              >
                <circle cx="40" cy="28" r="14" />
                <path d="M12 70c0-15.5 12.5-28 28-28s28 12.5 28 28" />
              </svg>
              <span className="absolute right-1 bottom-1 flex size-7 items-center justify-center rounded-full bg-[#c9a227] text-[0.625rem] font-bold text-white shadow-sm sm:size-8 sm:text-[0.6875rem]">
                ★
              </span>
            </div>
          </div>

          {/* CTA — bottom of viewport on small screens */}
          <div className="bf-hero-text bf-delay-3 mt-auto w-full shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:mt-0 lg:pb-0">
            <BfHeroActions />
          </div>
        </div>
      </div>
    </section>
  );
}
