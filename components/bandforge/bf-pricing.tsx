"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import {
  BfPricingCard,
  BfSectionEyebrow,
  BfSectionHeading,
} from "@/components/bandforge/ui";
import { useBfSectionReveal } from "@/components/bandforge/use-bf-section-reveal";
import type { GlowColor } from "@/components/ui/spotlight-card";
import { BRAND_PRICING_TIERS } from "@/lib/brand-mock-data";

const TIER_HREF: Record<string, string> = {
  free: "/diagnostic",
  starter: "/pricing",
  standard: "/pricing",
};

/** Brand glow cycle — teal / cyan / navy */
const TIER_GLOW: Record<string, GlowColor> = {
  free: "teal",
  starter: "cyan",
  standard: "navy",
};

/** Alternating entrance — left / up / right */
const CARD_REVEAL = ["left", "up", "right"] as const;

export function BandForgePricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  useBfSectionReveal(sectionRef, { reduceMotion, start: "top 88%" });

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative z-[2] scroll-mt-20 overflow-x-clip bf-section"
      style={{
        backgroundImage: [
          "radial-gradient(ellipse 70% 50% at 18% 28%, rgb(0 188 212 / 0.045), transparent 62%)",
          "radial-gradient(ellipse 60% 45% at 82% 62%, rgb(0 151 167 / 0.035), transparent 58%)",
        ].join(", "),
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-16 bg-gradient-to-b from-transparent to-white sm:h-20"
        aria-hidden
      />

      <div className="bf-container relative z-[1]">
        <div className="bf-section-head mb-8 lg:mb-12">
          <div data-bf-reveal="fade" data-bf-reveal-delay="0">
            <BfSectionEyebrow className="mb-3">Pricing</BfSectionEyebrow>
          </div>
          <div data-bf-reveal="up" data-bf-reveal-delay="0.1">
            <BfSectionHeading>Start free, upgrade when ready</BfSectionHeading>
          </div>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-7">
          {BRAND_PRICING_TIERS.map((tier, index) => (
            <div
              key={tier.id}
              className="h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-1"
              data-bf-reveal={CARD_REVEAL[index] ?? "up"}
              data-bf-reveal-delay={String(0.12 + index * 0.1)}
            >
              <BfPricingCard
                id={tier.id}
                name={tier.name}
                price={tier.price}
                period={tier.period}
                description={tier.description}
                cta={tier.cta}
                href={TIER_HREF[tier.id] ?? "/pricing"}
                recommended={tier.recommended}
                variant={tier.variant}
                glowColor={TIER_GLOW[tier.id] ?? "cyan"}
              />
            </div>
          ))}
        </div>

        <p
          className="mx-auto mt-7 max-w-xl px-2 text-center text-[0.8125rem] leading-relaxed text-muted-light lg:mt-[38px] lg:text-sm"
          data-bf-reveal="up"
          data-bf-reveal-delay="0.35"
        >
          Built by a Gold Medallist, Band 9 scorer, and 10-year IELTS trainer.
        </p>
      </div>
    </section>
  );
}
