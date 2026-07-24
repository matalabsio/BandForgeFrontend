import { Play } from "lucide-react";
import { BfHeroActions } from "@/components/bandforge/bf-hero-actions";
import { BfHeroAntigravity } from "@/components/bandforge/bf-hero-antigravity";
import CircularText from "@/components/bandforge/circular-text";

export function BandForgeHero() {
  return (
    <section
      className="bf-ambient bf-ambient-from-top relative flex min-h-dvh -mt-[4.75rem] flex-col overflow-hidden bg-surface !pt-[4.75rem] !pb-3 sm:!pb-4 lg:!pb-4"
      aria-labelledby="bf-hero-heading"
    >
      <BfHeroAntigravity />

      {/* Desktop circular loop — under Pricing↔Dashboard gap */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(4.75rem+8px)] z-20 hidden lg:block">
        <div className="relative mx-auto flex w-full max-w-[1200px] items-start px-10">
          <div className="ml-auto flex items-start" aria-hidden>
            <div className="invisible flex items-center gap-7 text-[0.9375rem] font-medium">
              <span className="inline-flex items-center gap-2">
                <span className="size-4 shrink-0" />
                Pricing
              </span>
            </div>
            <div className="relative w-6 shrink-0">
              <div className="pointer-events-auto absolute top-0 left-1/2 translate-x-[calc(-50%+76px)]">
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
      <div className="pointer-events-auto absolute top-[calc(4.75rem+12px)] right-[calc(1rem+24px-10px-30px-30px)] z-30 origin-top-right scale-[0.78] sm:top-[calc(4.75rem+12px)] sm:right-[calc(2em+28px-10px-30px-30px)] sm:scale-[0.82] lg:hidden">
        <div className="-translate-x-1/2">
          <CircularText
            text="BUILT BY A GOLD MEDALLIST • "
            onHover="speedUp"
            spinDuration={22}
            className="text-navy"
          />
        </div>
      </div>

      <div className="bf-container pointer-events-none relative z-20 flex w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col text-center lg:max-w-3xl">
          {/* Top: headline — 3 lines on mobile, 2 lines on desktop */}
          <div className="flex shrink-0 flex-col items-center px-1 pt-12 sm:pt-14 lg:pt-[97px]">
            <h1
              id="bf-hero-heading"
              className="bf-hero-title bf-delay-1 relative z-20 font-display mb-0 text-[1.625rem] leading-[1.28] font-bold tracking-[-0.03em] text-navy sm:text-[2.125rem] sm:leading-[1.24] lg:text-[3.25rem] lg:leading-[1.15] lg:tracking-[-0.035em]"
            >
              <span className="lg:hidden">
                <span className="block">
                  If you took the <span className="text-cyan">IELTS</span>
                </span>
                <span className="block">today, what would</span>
                <span className="block">
                  your <span className="text-cyan">band</span> be?
                </span>
              </span>
              <span className="hidden lg:block">
                <span className="block">
                  If you took the{" "}
                  <span className="text-cyan">IELTS</span> today,
                </span>
                <span className="block">
                  what would your <span className="text-cyan">band</span> be?
                </span>
              </span>
            </h1>
          </div>

          {/* Middle gap: larger square portrait + demo play */}
          <div className="pointer-events-none flex min-h-0 flex-1 flex-col items-center justify-center py-3 sm:py-4 lg:py-5">
            <div className="bf-hero-text bf-delay-2 relative aspect-square w-[min(100%,15.75rem)] shrink-0 overflow-hidden sm:w-[min(100%,16rem)] lg:w-[min(100%,16.5rem)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/talkinghead.png"
                alt=""
                width={264}
                height={264}
                className="size-full object-cover object-center"
                aria-hidden
              />
              <button
                type="button"
                className="pointer-events-auto absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                aria-label="Play demo"
              >
                <span className="absolute bottom-[14%] left-1/2 inline-flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white shadow-[0_4px_14px_rgb(0_0_0/0.28)] backdrop-blur-[2px] transition-[transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 hover:border-white/55 hover:bg-black/45 sm:bottom-[16%] sm:size-10 lg:bottom-[18%] lg:size-11">
                  <Play
                    className="ml-0.5 size-3.5 fill-current sm:size-4 lg:size-[1.125rem]"
                    strokeWidth={0}
                    aria-hidden
                  />
                </span>
              </button>
            </div>
          </div>

          {/* Bottom: description → CTA */}
          <div className="mt-auto flex w-full shrink-0 flex-col items-center pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:pb-0">
            <p className="bf-hero-text bf-delay-2 relative z-20 mx-auto mb-3 max-w-[40ch] px-1 text-[0.875rem] leading-[1.6] text-muted sm:mb-4 sm:max-w-[46ch] sm:text-base sm:leading-[1.75] lg:mb-4 lg:max-w-[42ch] lg:text-[1.125rem] lg:leading-[1.7]">
              A free diagnostic test that tells you exactly where you stand —
              across all four sections — in 90 minutes.
            </p>

            <div className="bf-hero-text bf-delay-3 w-full lg:w-auto">
              <BfHeroActions />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
