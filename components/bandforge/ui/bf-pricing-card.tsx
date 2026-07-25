"use client";

import Link from "next/link";
import {
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
} from "@/components/bandforge/bf-primary-cta-styles";
import { GlowCard, type GlowColor } from "@/components/ui/spotlight-card";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  cta: string;
  href?: string;
  recommended?: boolean;
  variant: "outline" | "primary";
  glowColor?: GlowColor;
};

const pricingCtaClass = cn(
  "relative inline-flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border border-transparent font-display text-sm font-semibold leading-none text-white no-underline shadow-[0_8px_22px_rgb(0_151_167/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2",
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
  "min-h-11 px-4 py-3 text-center lg:min-h-[var(--spacing-touch)] lg:text-[0.9375rem]",
);

export function BfPricingCard({
  name,
  price,
  period,
  description,
  cta,
  href = "/plan",
  recommended = false,
  glowColor = "cyan",
}: Props) {
  const periodLabel = period?.replace("/ ", "") ?? null;

  return (
    <div className={cn("relative h-full", recommended && "mt-1 lg:mt-0")}>
      {recommended ? (
        <span className="absolute -top-[11px] left-1/2 z-10 -translate-x-1/2 rounded-full bg-cyan px-3 py-1 font-mono text-[0.625rem] tracking-[0.1em] text-white uppercase shadow-[0_6px_16px_rgb(0_188_212/0.35)] lg:px-4 lg:text-[0.6875rem]">
          Recommended
        </span>
      ) : null}

      <GlowCard
        glass
        customSize
        glowColor={glowColor}
        className={cn(
          "group bf-liquid-glass h-full w-full !rounded-[1.35rem] !p-5 lg:!rounded-[1.5rem] lg:!p-7",
          recommended && "ring-1 ring-cyan/15",
        )}
      >
        {/* Specular highlight — liquid glass sheen */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
          aria-hidden
        >
          <div className="absolute -top-1/3 left-[-10%] h-[70%] w-[120%] rotate-[-8deg] bg-[linear-gradient(180deg,rgb(255_255_255/0.55)_0%,rgb(255_255_255/0.08)_45%,transparent_70%)] opacity-80" />
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>

        <div className="relative z-[1] flex h-full flex-col">
          <div className="flex items-baseline justify-between gap-4 lg:block">
            <h3 className="font-display text-lg font-bold text-navy lg:text-xl">
              {name}
            </h3>
            <div className="shrink-0 text-right lg:mt-3 lg:text-left">
              <span
                className={cn(
                  "font-mono text-xl font-medium lg:text-[2.125rem]",
                  recommended ? "text-cyan" : "text-navy",
                )}
              >
                {price}
              </span>
              {periodLabel ? (
                <p className="text-[0.6875rem] text-muted-light lg:text-sm">
                  <span className="lg:hidden">{periodLabel}</span>
                  <span className="hidden lg:inline">{period}</span>
                </p>
              ) : null}
            </div>
          </div>

          <p className="mt-2 text-[0.84375rem] leading-normal text-muted lg:mt-4 lg:text-sm lg:leading-relaxed">
            {description}
          </p>

          <div className="mt-auto pt-5 lg:pt-6">
            <Link href={href} prefetch className={pricingCtaClass}>
              <span className="relative z-[1]">{cta}</span>
            </Link>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
