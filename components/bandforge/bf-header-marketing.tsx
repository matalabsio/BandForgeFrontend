"use client";

import Link from "next/link";
import BubbleMenu from "@/components/bandforge/bubble-menu";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import { BfMarketingWordmark } from "@/components/bandforge/bf-marketing-wordmark";
import { BfMarketingNavIcon } from "@/components/bandforge/bf-marketing-nav-icon";
import {
  BF_MARKETING_NAV,
  BF_MARKETING_START_CTA_LABEL,
} from "@/components/bandforge/bf-marketing-nav";
import { useMarketingStartCta } from "@/components/bandforge/bf-use-marketing-start-cta";

const navLink =
  "inline-flex cursor-pointer items-center gap-2 text-[0.9375rem] font-medium text-muted no-underline transition-colors duration-200 hover:text-navy";
const navLinkActive =
  "inline-flex cursor-pointer items-center gap-2 text-[0.9375rem] font-semibold text-navy no-underline transition-colors duration-200";

const startCtaClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-cyan px-[22px] py-2.5 text-[0.9375rem] font-semibold text-white no-underline transition-colors hover:bg-brand-sky-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2";

type Props = {
  activeHref?: string;
};

const desktopLinks = BF_MARKETING_NAV.filter(
  (item) => item.label !== BF_MARKETING_START_CTA_LABEL,
);

/** Desktop: classic sticky nav. Mobile: BubbleMenu. Same routes. */
export function BandForgeHeaderMarketing({ activeHref }: Props) {
  const startCta = useMarketingStartCta("/dashboard");

  const bubbleItems = BF_MARKETING_NAV.map((item) => {
    if (item.label === BF_MARKETING_START_CTA_LABEL) {
      return {
        label: startCta.label,
        href: startCta.href,
        ariaLabel: startCta.ariaLabel,
        rotation: item.rotation,
        hoverStyles: item.hoverStyles,
      };
    }
    return {
      label: item.label,
      href: item.href,
      ariaLabel: item.ariaLabel ?? item.label,
      rotation: item.rotation,
      hoverStyles: item.hoverStyles,
    };
  });

  return (
    <>
      <header className="sticky top-0 z-30 hidden w-full border-b border-border-soft bg-white/92 backdrop-blur-[10px] lg:block lg:bg-white/90 lg:backdrop-blur-[12px]">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3.5 sm:px-5 lg:px-10 lg:py-4">
          <BfMarketingWordmark />

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-7" aria-label="Primary">
              {desktopLinks.map((item) => {
                const active = activeHref === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    className={active ? navLinkActive : navLink}
                    aria-current={active ? "page" : undefined}
                  >
                    <BfMarketingNavIcon name={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href={startCta.href}
              prefetch
              className={startCtaClass}
              aria-label={startCta.ariaLabel}
            >
              {startCta.label}
            </Link>
          </div>
        </div>
      </header>

      <header className="pointer-events-none relative z-30 h-[4.75rem] lg:hidden">
        <BubbleMenu
          logo={
            <span className="inline-flex items-center gap-2">
              <BfBrandBars size="sm" />
              <span className="font-display text-[1.0625rem] leading-none font-bold tracking-[-0.025em]">
                <span className="text-navy">Band</span>
                <span className="text-cyan">Forge</span>
              </span>
            </span>
          }
          items={bubbleItems}
          menuAriaLabel="Toggle navigation"
          menuBg="#ffffff"
          menuContentColor="#0d1f3c"
          useFixedPosition
          animationEase="back.out(1.5)"
          animationDuration={0.5}
          staggerDelay={0.12}
        />
      </header>
    </>
  );
}
