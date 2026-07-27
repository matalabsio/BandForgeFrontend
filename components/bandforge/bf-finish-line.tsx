"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { useBfSectionReveal } from "@/components/bandforge/use-bf-section-reveal";

gsap.registerPlugin(ScrollTrigger);

const NAVY = "#0d1f3c";

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
 * Landing Finish Line — brand footer only (testimonials temporarily hidden).
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
      aria-label="BandForge footer"
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(40vh,260px)]"
        style={{
          background: `radial-gradient(ellipse 85% 65% at 50% 0%, rgb(0 188 212 / 0.05), transparent 65%)`,
        }}
        aria-hidden
      />

      <div className="relative z-[1]" data-bf-reveal="up" data-bf-reveal-delay="0.05">
        <BandForgeSiteFooter embedded className="bg-transparent" />
      </div>
    </section>
  );
}
