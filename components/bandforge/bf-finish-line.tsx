"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BF_FOOTER_COLUMNS,
  BF_FOOTER_YEAR,
} from "@/components/bandforge/bf-footer-links";
import { useBfSectionReveal } from "@/components/bandforge/use-bf-section-reveal";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { BRAND_TESTIMONIALS } from "@/lib/brand-mock-data";

gsap.registerPlugin(ScrollTrigger);

const TEAL = "#0097a7";
const CYAN = "#00bcd4";
const NAVY = "#0d1f3c";
const MUTED = "#94A3B8";
const HEADING = "#E5E7EB";

const SECTION_BG = [
  `radial-gradient(ellipse 90% 55% at 50% -10%, rgb(0 188 212 / 0.06), transparent 58%)`,
  `radial-gradient(ellipse 70% 50% at 100% 100%, rgb(0 151 167 / 0.05), transparent 52%)`,
  `radial-gradient(ellipse 50% 40% at 0% 80%, rgb(0 188 212 / 0.03), transparent 48%)`,
  `linear-gradient(165deg, ${NAVY} 0%, #0c1d38 50%, ${NAVY} 100%)`,
].join(", ");

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

/**
 * Landing Finish Line — floating testimonials + minimal brand footer.
 */
export function BandForgeFinishLine() {
  const reduceMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useBfSectionReveal(sectionRef, { reduceMotion, start: "top 82%" });

  useEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    if (!section || !glow) return;

    if (reduceMotion) {
      gsap.set(glow, { clearProps: "all", opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(glow, { opacity: 0 });
      gsap.to(glow, {
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });

      gsap.fromTo(
        glow,
        { y: -6 },
        {
          y: 6,
          duration: 12.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1,
        },
      );
    }, section);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="final-cta"
      className="relative scroll-mt-20 overflow-hidden text-white"
      style={{ background: SECTION_BG }}
      aria-labelledby="bf-testimonials-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-20 bg-gradient-to-b from-white via-white/50 to-transparent sm:h-24"
        aria-hidden
      />

      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(40vh,260px)]"
        style={{
          background: `radial-gradient(ellipse 85% 65% at 50% 0%, rgb(0 188 212 / 0.05), transparent 65%)`,
        }}
        aria-hidden
      />

      <div className="relative z-[1] flex w-full flex-col items-center pt-16 pb-12 sm:pb-14 lg:pt-20 lg:pb-16">
        <div className="mx-auto mb-8 max-w-[40rem] px-6 text-center sm:mb-10 sm:px-8">
          <p
            className="font-mono text-[0.6875rem] tracking-[0.16em] text-[#00bcd4] uppercase sm:text-xs"
            data-bf-reveal="fade"
            data-bf-reveal-delay="0"
          >
            Student stories
          </p>
          <h2
            id="bf-testimonials-heading"
            className="font-display mt-3 text-[clamp(1.75rem,3.8vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.035em] text-white"
            data-bf-reveal="up"
            data-bf-reveal-delay="0.1"
          >
            Real bands. Real students.
          </h2>
          <p
            className="mx-auto mt-3 max-w-[36ch] text-[0.9375rem] leading-relaxed sm:mt-4 sm:text-base"
            style={{ color: MUTED }}
            data-bf-reveal="left"
            data-bf-reveal-delay="0.18"
          >
            What learners across Telangana and Andhra say after diagnosis-first
            prep.
          </p>
        </div>

        <div
          className="flex w-full flex-col gap-2 sm:gap-3"
          data-bf-reveal="up"
          data-bf-reveal-delay="0.22"
          data-bf-reveal-duration="0.95"
        >
          {/* Row 1 — left → right */}
          <InfiniteMovingCards
            items={[...BRAND_TESTIMONIALS]}
            direction="right"
            speed="slow"
            pauseOnHover
            interactive
            variant="glass"
            className="max-w-none"
          />
          {/* Row 2 — opposite right → left */}
          <InfiniteMovingCards
            items={[...BRAND_TESTIMONIALS].reverse()}
            direction="left"
            speed="slow"
            pauseOnHover
            interactive
            variant="glass"
            className="max-w-none"
          />
        </div>
      </div>

      <footer className="relative z-[1] border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-12 sm:px-8 sm:py-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-14 xl:gap-20">
            <div className="max-w-xs" data-bf-reveal="left" data-bf-reveal-delay="0.05">
              <Link
                href="/"
                prefetch
                className="inline-flex cursor-pointer items-center gap-2.5 no-underline"
                aria-label="BandForge home"
              >
                <div className="flex h-[17px] items-end gap-[3px]" aria-hidden>
                  {["42%", "62%", "81%", "100%"].map((h, i) => (
                    <div
                      key={h}
                      className="w-[4px] rounded-sm"
                      style={{
                        height: h,
                        backgroundColor: i < 2 ? TEAL : CYAN,
                      }}
                    />
                  ))}
                </div>
                <span className="font-display text-[1.125rem] font-bold tracking-tight text-white">
                  Band<span style={{ color: CYAN }}>Forge</span>
                </span>
              </Link>
              <p
                className="mt-4 text-[0.8125rem] leading-relaxed sm:text-[0.875rem]"
                style={{ color: MUTED }}
              >
                IELTS prep for Telugu- and Urdu-speaking students in Telangana
                and Andhra Pradesh. Free diagnostic · skill sprints from ₹999.
                Based in Hyderabad.
              </p>
              <p className="mt-6 text-xs" style={{ color: MUTED }}>
                © {BF_FOOTER_YEAR} BandForge
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-5 lg:gap-x-6">
              {BF_FOOTER_COLUMNS.map((col, i) => (
                <div
                  key={col.title}
                  data-bf-reveal={i % 2 === 0 ? "up" : "down"}
                  data-bf-reveal-delay={String(0.1 + i * 0.07)}
                >
                  <p
                    className="text-[0.8125rem] font-semibold tracking-wide"
                    style={{ color: HEADING }}
                  >
                    {col.title}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {col.links.map((l) => (
                      <li key={`${col.title}-${l.href}-${l.label}`}>
                        <Link
                          href={l.href}
                          prefetch
                          className="inline-block cursor-pointer text-[0.8125rem] no-underline transition-[color,transform] duration-200 ease-out hover:translate-x-1 hover:text-white sm:text-[0.875rem]"
                          style={{ color: MUTED }}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
