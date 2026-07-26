"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Target,
  Timer,
  Waves,
} from "lucide-react";
import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import {
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
  bfPrimaryCtaHeroClass,
} from "@/components/bandforge/bf-primary-cta-styles";
import { GlowCard, type GlowColor } from "@/components/ui/spotlight-card";
import { BRAND_MODULES, type ModuleKey } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1] as const;

const MODULE_GLOW: Record<ModuleKey, GlowColor> = {
  listening: "cyan",
  reading: "teal",
  writing: "navy",
  speaking: "cyan",
};

const MODULE_HREF: Record<ModuleKey, string> = {
  listening: "/diagnostic",
  reading: "/diagnostic",
  writing: "/writing",
  speaking: "/speaking",
};

const MODULE_LEAD: Record<ModuleKey, string> = {
  listening:
    "Train ears for the accents and traps that show up on test day — not studio-clean podcast audio.",
  reading:
    "Build speed without guessing. Every format the paper uses, under the real clock.",
  writing:
    "Line-by-line scoring on the four official criteria — so you fix the band that is capping you.",
  speaking:
    "Full spoken answers scored for fluency, range, and pronunciation across all three parts.",
};

const PILLARS = [
  {
    icon: Target,
    title: "Aimed at your leak",
    body: "Drills follow the diagnostic — vocabulary, timing, structure — not a random question dump.",
  },
  {
    icon: Waves,
    title: "Real exam patterns",
    body: "Question types pulled from what actually appears, built from years of tracking test day.",
  },
  {
    icon: Timer,
    title: "Timed like the real thing",
    body: "Pressure is part of the skill. Practice under exam timing so the clock stops being the enemy.",
  },
] as const;

function FadeUp({
  children,
  className,
  delay = 0,
  x = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  x?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.35, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function HeroCtas() {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <Link href="/diagnostic" prefetch className={bfPrimaryCtaHeroClass}>
        <span className="relative z-[1]">Take free diagnostic</span>
        <ArrowRight
          className="relative z-[1] size-4 shrink-0"
          strokeWidth={2.25}
          aria-hidden
        />
      </Link>
      <Link
        href="/pricing"
        prefetch
        className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-navy/10 bg-white/85 px-7 font-display text-[0.9375rem] font-semibold text-navy no-underline transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-cyan/35 hover:bg-white hover:shadow-[0_10px_28px_-18px_rgb(0_151_167/0.35)]"
      >
        View pricing
      </Link>
    </div>
  );
}

/**
 * Premium `/drills` — minimal liquid-glass, GSAP scroll + Framer parallax.
 * Text is left-aligned in content columns; section rhythm stays calm.
 */
export function DrillsExperience() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const washFarRef = useRef<HTMLDivElement>(null);
  const washNearRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 72]),
    { stiffness: 80, damping: 28, mass: 0.4 },
  );
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.75],
    [1, reduceMotion ? 1 : 0.35],
  );
  const heroScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, reduceMotion ? 1 : 0.985],
  );

  useEffect(() => {
    if (reduceMotion) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const heroBits =
        heroRef.current?.querySelectorAll<HTMLElement>("[data-dx-hero]");
      if (heroBits?.length) {
        gsap.set(heroBits, { autoAlpha: 0, y: 36 });
        gsap.to(heroBits, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.11,
          ease: "power3.out",
          delay: 0.06,
          onComplete: () => {
            gsap.set(heroBits, { clearProps: "transform" });
          },
        });
      }

      if (washFarRef.current) {
        gsap.fromTo(
          washFarRef.current,
          { yPercent: -8, scale: 0.94, opacity: 0.5 },
          {
            yPercent: 18,
            scale: 1.06,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.1,
            },
          },
        );
      }

      if (washNearRef.current) {
        gsap.fromTo(
          washNearRef.current,
          { yPercent: 6, scale: 1 },
          {
            yPercent: -22,
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.7,
            },
          },
        );
      }

      root
        .querySelectorAll<HTMLElement>("[data-dx-parallax]")
        .forEach((el) => {
          const speed = Number(el.dataset.dxParallax ?? 0.12);
          gsap.fromTo(
            el,
            { y: -24 * speed },
            {
              y: 48 * speed,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

      root.querySelectorAll<HTMLElement>("[data-dx-line]").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: line,
              start: "top 90%",
              once: true,
            },
          },
        );
      });
    }, root);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [reduceMotion]);

  return (
    <div ref={rootRef} className="min-h-dvh overflow-x-clip bg-white text-ink">
      <BandForgeHeaderMarketing activeHref="/drills" overHero />

      <main>
        {/* ——— Hero ——— */}
        <section
          ref={heroRef}
          className="relative min-h-[min(88vh,760px)] overflow-hidden border-b border-border/50"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div
              ref={washFarRef}
              className="absolute -left-[18%] top-[-12%] size-[min(78vw,560px)] rounded-full bg-[rgb(0_188_212/0.14)] blur-[100px]"
            />
            <div
              ref={washNearRef}
              className="absolute -right-[12%] bottom-[-18%] size-[min(62vw,440px)] rounded-full bg-[rgb(0_151_167/0.11)] blur-[90px]"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
          </div>

          <motion.div
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            className="bf-container relative z-[1] grid min-h-[min(88vh,760px)] items-center gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:py-28 xl:gap-16"
          >
            <div className="flex flex-col items-start text-left">
              <Link
                href="/"
                prefetch
                data-dx-hero
                className="inline-flex w-fit cursor-pointer rounded-full border border-border/80 bg-white/75 px-3 py-1 text-meta font-semibold text-ink/55 no-underline backdrop-blur-sm transition-colors duration-200 hover:text-navy"
                style={reduceMotion ? undefined : { opacity: 0 }}
              >
                Back to home
              </Link>

              <p
                data-dx-hero
                className="mt-8 font-mono text-[0.6875rem] tracking-[0.18em] text-cyan uppercase sm:text-xs"
                style={reduceMotion ? undefined : { opacity: 0 }}
              >
                The Drills
              </p>

              <h1
                data-dx-hero
                className="font-display mt-4 max-w-[15ch] text-left text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.05em] text-navy text-balance"
                style={reduceMotion ? undefined : { opacity: 0 }}
              >
                Four skills.
                <br />
                <span className="text-cyan">Real exam formats.</span>
              </h1>

              <p
                data-dx-hero
                className="mt-5 max-w-[38ch] text-left text-[1.0625rem] leading-[1.55] text-muted sm:mt-6 sm:max-w-[44ch] sm:text-lg"
                style={reduceMotion ? undefined : { opacity: 0 }}
              >
                Listening, Reading, Writing, Speaking — drilled the way the exam
                actually works, aimed at the gap your diagnostic finds.
              </p>

              <div
                data-dx-hero
                className="mt-9 sm:mt-11"
                style={reduceMotion ? undefined : { opacity: 0 }}
              >
                <HeroCtas />
              </div>
            </div>

            <div
              data-dx-hero
              className="relative mx-auto flex w-full max-w-[420px] items-center justify-center lg:mx-0 lg:max-w-none lg:justify-end"
              style={reduceMotion ? undefined : { opacity: 0 }}
            >
              <div
                data-dx-parallax="0.14"
                className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgb(0_188_212/0.12),transparent_68%)] blur-2xl sm:-inset-10"
                aria-hidden
              />
              <motion.div
                className="relative w-full"
                animate={
                  reduceMotion
                    ? undefined
                    : { y: [0, -10, 0] }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              >
                <Image
                  src="/drills-hero-removebg-preview.png"
                  alt="Student preparing for IELTS — checklist practice with feedback"
                  width={612}
                  height={408}
                  priority
                  className="relative z-[1] h-auto w-full max-w-[min(100%,520px)] object-contain drop-shadow-[0_24px_48px_rgb(13_31_60/0.12)] lg:max-w-none"
                  sizes="(max-width: 1024px) min(90vw, 520px), min(42vw, 560px)"
                />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ——— Modules ——— */}
        <section
          id="modules"
          className="bf-section relative scroll-mt-24"
          aria-labelledby="drills-modules-heading"
        >
          <div
            data-dx-parallax="0.08"
            className="pointer-events-none absolute top-[10%] right-[-8%] size-[280px] rounded-full bg-[rgb(0_188_212/0.05)] blur-[80px]"
            aria-hidden
          />

          <div className="bf-container relative">
            <div className="mb-10 max-w-xl text-left lg:mb-14">
              <FadeUp>
                <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-cyan uppercase sm:text-xs">
                  Skill practice
                </p>
              </FadeUp>
              <FadeUp delay={0.06}>
                <h2
                  id="drills-modules-heading"
                  className="font-display mt-3 text-left text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.06] font-bold tracking-[-0.035em] text-navy text-balance"
                >
                  Every format the exam actually uses
                </h2>
              </FadeUp>
              <FadeUp delay={0.1}>
                <p className="mt-3 max-w-[46ch] text-left text-[0.9375rem] leading-relaxed text-muted sm:text-base">
                  Real exam simulations — not generic quizzes. Built from years
                  of tracking what shows up on test day.
                </p>
              </FadeUp>
              <div
                data-dx-line
                className="mt-7 h-px w-16 origin-left bg-gradient-to-r from-cyan to-teal/40"
                aria-hidden
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7">
              {BRAND_MODULES.map((mod, index) => {
                const Icon = mod.Icon;
                return (
                  <FadeUp
                    key={mod.key}
                    delay={0.04 + index * 0.07}
                    x={index % 2 === 0 ? -18 : 18}
                    className="h-full"
                  >
                    <Link
                      href={MODULE_HREF[mod.key]}
                      prefetch
                      className="group block h-full cursor-pointer no-underline"
                      aria-label={`${mod.title} drills`}
                    >
                      <div className="h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                        <GlowCard
                          glass
                          inkBorder
                          customSize
                          spotlight={false}
                          glowColor={MODULE_GLOW[mod.key]}
                          className="bf-liquid-glass relative h-full min-h-[280px] w-full !rounded-[1.35rem] !p-5 sm:min-h-[300px] lg:!rounded-[1.5rem] lg:!p-7"
                        >
                          <div
                            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
                            aria-hidden
                          >
                            <div className="absolute -top-1/3 left-[-10%] h-[70%] w-[120%] rotate-[-8deg] bg-[linear-gradient(180deg,rgb(255_255_255/0.55)_0%,rgb(255_255_255/0.08)_45%,transparent_70%)] opacity-80" />
                            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                          </div>

                          <div className="relative z-[1] flex h-full flex-col text-left">
                            <div className="mb-4 inline-flex size-11 items-center justify-center self-start rounded-2xl bg-white/90 text-cyan shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
                              <Icon className="size-5" strokeWidth={1.85} />
                            </div>

                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-display text-[1.375rem] leading-none font-bold tracking-[-0.025em] text-navy lg:text-[1.5rem]">
                                {mod.title}
                              </h3>
                              <span
                                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white/70 text-navy/45 transition-[border-color,color,transform,background-color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-cyan/35 group-hover:text-cyan"
                                aria-hidden
                              >
                                <ArrowUpRight
                                  className="size-3.5"
                                  strokeWidth={1.75}
                                />
                              </span>
                            </div>

                            <p className="mt-3 text-[0.875rem] leading-relaxed text-muted lg:text-[0.9375rem]">
                              {MODULE_LEAD[mod.key]}
                            </p>

                            <ul className="mt-4 flex flex-col gap-2.5">
                              {mod.highlights.map((item) => (
                                <li
                                  key={item}
                                  className="flex items-start gap-2.5 text-[0.8125rem] leading-[1.5] text-muted lg:text-[0.875rem]"
                                >
                                  <Check
                                    className="mt-0.5 size-3.5 shrink-0 text-cyan"
                                    strokeWidth={2.5}
                                    aria-hidden
                                  />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>

                            <p className="mt-auto pt-5 font-display text-[0.875rem] font-semibold text-navy lg:text-[0.9375rem]">
                              {mod.footer}
                            </p>
                          </div>
                        </GlowCard>
                      </div>
                    </Link>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        {/* ——— Pillars ——— */}
        <section className="bf-section relative border-t border-border-soft bg-[#f7fbfc]">
          <div
            data-dx-parallax="0.1"
            className="pointer-events-none absolute bottom-[-10%] left-[-6%] size-[240px] rounded-full bg-[rgb(0_151_167/0.06)] blur-[70px]"
            aria-hidden
          />
          <div className="bf-container relative">
            <div className="mb-10 max-w-lg text-left lg:mb-12">
              <FadeUp>
                <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-cyan uppercase">
                  Why these drills
                </p>
              </FadeUp>
              <FadeUp delay={0.06}>
                <h2 className="font-display mt-3 text-left text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-navy text-balance">
                  Practice that closes the gap
                </h2>
              </FadeUp>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
              {PILLARS.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <FadeUp key={pillar.title} delay={0.05 + i * 0.07}>
                    <article className="h-full rounded-[1.25rem] border border-navy/[0.07] bg-white/95 p-5 text-left shadow-[0_18px_48px_-36px_rgb(13_31_60/0.16)] sm:p-6">
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[rgb(0_188_212/0.1)] text-cyan">
                        <Icon
                          className="size-5"
                          strokeWidth={1.85}
                          aria-hidden
                        />
                      </span>
                      <h3 className="font-display mt-4 text-lg font-bold tracking-[-0.02em] text-navy">
                        {pillar.title}
                      </h3>
                      <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
                        {pillar.body}
                      </p>
                    </article>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        {/* ——— CTA ——— */}
        <section
          className="relative overflow-hidden bg-navy"
          style={{
            backgroundImage: [
              "radial-gradient(ellipse 70% 55% at 50% -5%, rgb(0_188_212/0.14), transparent 55%)",
              "linear-gradient(165deg, #0d1f3c 0%, #0c1d38 100%)",
            ].join(", "),
          }}
        >
          <div
            data-dx-parallax="0.15"
            className="pointer-events-none absolute top-[20%] left-[10%] z-0 size-[200px] rounded-full bg-[rgb(0_188_212/0.08)] blur-[60px]"
            aria-hidden
          />
          <div className="bf-container relative z-[2] py-16 text-center text-white sm:py-20 lg:py-24">
            <motion.div
              initial={reduceMotion ? false : { y: 16 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="text-white"
            >
              <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-[#00bcd4] uppercase">
                Start with the gap
              </p>
              <h2 className="font-display mx-auto mt-3 max-w-[20ch] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.035em] text-balance text-white">
                Know what to drill before you grind hours
              </h2>
              <p className="mx-auto mt-3 max-w-[38ch] text-[0.9375rem] leading-relaxed text-white/75 sm:text-base">
                Free diagnostic first — then Writing, Speaking, Dual, or All
                Skills sprints from ₹999.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
                <Link
                  href="/diagnostic"
                  prefetch
                  className={cn(
                    "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent px-8 font-display text-[0.9375rem] font-semibold text-white no-underline shadow-[0_8px_22px_rgb(0_151_167/0.28)]",
                    BF_PRIMARY_CTA_GRADIENT,
                    BF_PRIMARY_CTA_HOVER,
                  )}
                >
                  Take free diagnostic
                  <ArrowRight
                    className="size-4"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/pricing"
                  prefetch
                  className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 font-display text-[0.9375rem] font-semibold text-white no-underline transition-[border-color,background-color] duration-300 hover:border-white/40 hover:bg-white/15"
                >
                  View pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <BandForgeSiteFooter />
    </div>
  );
}
