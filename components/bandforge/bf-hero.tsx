"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play } from "lucide-react";
import { BfHeroActions } from "@/components/bandforge/bf-hero-actions";
import { BfHeroAntigravity } from "@/components/bandforge/bf-hero-antigravity";
import CircularText from "@/components/bandforge/circular-text";

gsap.registerPlugin(ScrollTrigger);

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduce;
}

/** Logo-color highlight — teal ↔ cyan only. */
function BandWord({ children }: { children: string }) {
  return (
    <span className="bf-hero-band relative inline-block">
      <span className="bf-hero-band-fill relative z-[1]">{children}</span>
      <span className="bf-hero-band-sweep" aria-hidden />
    </span>
  );
}

function Word({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bf-hero-word inline-block will-change-[transform,opacity,filter] ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

export function BandForgeHero() {
  const reduceMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [spotlightOn, setSpotlightOn] = useState(false);

  const onMove = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (reduceMotion || !spotlightOn) return;
      const section = sectionRef.current;
      const spot = spotlightRef.current;
      if (!section || !spot) return;
      const rect = section.getBoundingClientRect();
      gsap.to(spot, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        duration: 0.7,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
    [reduceMotion, spotlightOn],
  );

  /* Entrance + loops + scroll leave */
  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const words = section.querySelectorAll<HTMLElement>(".bf-hero-word");
    const video = videoRef.current;
    const desc = descRef.current;
    const cta = ctaRef.current;
    const bandFills = section.querySelectorAll<HTMLElement>(".bf-hero-band-fill");
    const bandSweeps = section.querySelectorAll<HTMLElement>(".bf-hero-band-sweep");

    if (reduceMotion) {
      gsap.set([words, video, desc, cta], {
        clearProps: "all",
        opacity: 1,
        y: 0,
        filter: "none",
        scale: 1,
      });
      gsap.set(content, { y: -40 });
      return;
    }

    const ctx = gsap.context(() => {
      const contentBaseY = -40;
      gsap.set(content, { y: contentBaseY });
      gsap.set(words, { opacity: 0, y: 40, filter: "blur(8px)" });
      gsap.set([video, desc, cta], { opacity: 0, y: 18 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.to(words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.85,
        stagger: 0.04,
      })
        .to(video, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.8)
        .to(desc, { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }, 1.0)
        .to(cta, { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }, 1.2)
        .add(() => setSpotlightOn(true), 2.0);

      if (video) {
        const floater = video.querySelector<HTMLElement>("[data-hero-video-float]");
        if (floater) {
          gsap.to(floater, {
            y: -3,
            duration: 6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.5,
          });
        }
      }

      if (bandFills.length) {
        gsap.to(bandFills, {
          backgroundPosition: "100% 50%",
          duration: 10,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
      }

      if (bandSweeps.length) {
        gsap.set(bandSweeps, { xPercent: -120, opacity: 0 });
        gsap.to(bandSweeps, {
          keyframes: [
            { opacity: 0, duration: 0 },
            { opacity: 0.15, xPercent: 120, duration: 0.5, ease: "power2.inOut" },
            { opacity: 0, duration: 0.05 },
            { xPercent: -120, duration: 0 },
          ],
          repeat: -1,
          repeatDelay: 7,
          delay: 8,
          stagger: 0.35,
        });
      }

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(content, {
            opacity: 1 - p * 0.85,
            y: contentBaseY + p * -36,
            scale: 1 - p * 0.04,
          });
        },
      });
    }, section);

    return () => {
      ctx.revert();
      setSpotlightOn(false);
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      className="bf-ambient bf-ambient-from-top relative flex min-h-dvh -mt-[4.75rem] flex-col overflow-hidden bg-surface !pt-[4.75rem] !pb-3 sm:!pb-4 lg:!pb-4"
      aria-labelledby="bf-hero-heading"
    >
      <BfHeroAntigravity />

      {/* Soft dissolve into the next section — tall, low mid-opacity so no hard cut */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[12] h-40 bg-gradient-to-b from-transparent via-white/25 to-white sm:h-44 lg:h-48"
        aria-hidden
      />

      {/* Cursor spotlight behind content */}
      {!reduceMotion ? (
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute top-0 left-0 z-[1] size-[min(55vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(14_165_233/0.06)] blur-[160px] transition-opacity duration-700"
          style={{ opacity: spotlightOn ? 1 : 0 }}
          aria-hidden
        />
      ) : null}

      {/* Desktop circular loop */}
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

      {/* Mobile circular loop */}
      <div className="pointer-events-auto absolute top-[calc(4.75rem+12px)] right-[calc(1rem+24px-10px-30px-30px)] z-30 origin-top-right scale-[0.78] sm:right-[calc(2em+28px-10px-30px-30px)] sm:scale-[0.82] lg:hidden">
        <div className="-translate-x-1/2">
          <CircularText
            text="BUILT BY A GOLD MEDALLIST • "
            onHover="speedUp"
            spinDuration={22}
            className="text-navy"
          />
        </div>
      </div>

      <div
        ref={contentRef}
        className="bf-container pointer-events-none relative z-20 flex w-full flex-1 flex-col will-change-transform"
        style={{ transform: "translateY(-40px)" }}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col text-center lg:max-w-3xl">
          <div className="flex shrink-0 flex-col items-center px-1 pt-12 sm:pt-14 lg:pt-[97px]">
            <h1
              id="bf-hero-heading"
              className="relative z-20 font-display mb-0 text-[1.625rem] leading-[1.28] font-bold tracking-[-0.03em] text-navy sm:text-[2.125rem] sm:leading-[1.24] lg:text-[3.25rem] lg:leading-[1.15] lg:tracking-[-0.035em]"
            >
              {/* Mobile — 3 lines; IELTS + band in logo colors */}
              <span className="lg:hidden">
                <span className="block">
                  <Word>If</Word> <Word>you</Word> <Word>took</Word>{" "}
                  <Word>the</Word>{" "}
                  <Word>
                    <BandWord>IELTS</BandWord>
                  </Word>
                </span>
                <span className="block">
                  <Word>today,</Word> <Word>what</Word> <Word>would</Word>
                </span>
                <span className="block">
                  <Word>your</Word>{" "}
                  <Word>
                    <BandWord>band</BandWord>
                  </Word>{" "}
                  <Word>be?</Word>
                </span>
              </span>

              {/* Desktop — 2 lines */}
              <span className="hidden lg:block">
                <span className="block">
                  <Word>If</Word> <Word>you</Word> <Word>took</Word>{" "}
                  <Word>the</Word>{" "}
                  <Word>
                    <BandWord>IELTS</BandWord>
                  </Word>{" "}
                  <Word>today,</Word>
                </span>
                <span className="block">
                  <Word>what</Word> <Word>would</Word> <Word>your</Word>{" "}
                  <Word>
                    <BandWord>band</BandWord>
                  </Word>{" "}
                  <Word>be?</Word>
                </span>
              </span>
            </h1>
          </div>

          <div className="pointer-events-none flex min-h-0 flex-1 flex-col items-center justify-center py-3 sm:py-4 lg:py-5">
            <div
              ref={videoRef}
              className="relative shrink-0 will-change-transform"
            >
              <div data-hero-video-float className="will-change-transform">
                <button
                  type="button"
                  className="pointer-events-auto group relative inline-flex cursor-pointer items-center gap-3 rounded-full border border-[#d5e3ea] bg-white/90 py-2 pr-5 pl-2 shadow-[0_10px_28px_-16px_rgb(0_151_167/0.35)] backdrop-blur-[8px] transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-cyan/40 hover:shadow-[0_14px_32px_-14px_rgb(0_151_167/0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-label="Play avatar demo"
                >
                  <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#e8f7f9_0%,#ffffff_55%,#e0f7fa_100%)] ring-2 ring-cyan/25 sm:size-12">
                    <span
                      className="size-full bg-[radial-gradient(circle_at_50%_35%,#b2ebf2_0%,#4dd0e1_42%,#0097a7_100%)] opacity-80"
                      aria-hidden
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-navy/25 transition-colors duration-300 group-hover:bg-navy/35">
                      <Play
                        className="ml-0.5 size-3.5 fill-white text-white sm:size-4"
                        strokeWidth={0}
                        aria-hidden
                      />
                    </span>
                  </span>
                  <span className="text-left">
                    <span className="block font-display text-[0.9375rem] leading-none font-semibold text-navy">
                      Avatar demo
                    </span>
                    <span className="mt-1 block text-[0.75rem] leading-none text-muted">
                      30 sec walkthrough
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto flex w-full shrink-0 flex-col items-center pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pb-10 lg:pb-10">
            <p
              ref={descRef}
              className="relative z-20 mx-auto mb-3 max-w-[40ch] px-1 text-[0.875rem] leading-[1.6] text-muted sm:mb-4 sm:max-w-[46ch] sm:text-base sm:leading-[1.75] lg:mb-4 lg:max-w-[42ch] lg:text-[1.125rem] lg:leading-[1.7]"
            >
              A free diagnostic test that tells you exactly where you stand —
              across all four sections — in 90 minutes.
            </p>

            <div ref={ctaRef} className="w-full lg:w-auto">
              <BfHeroActions />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
