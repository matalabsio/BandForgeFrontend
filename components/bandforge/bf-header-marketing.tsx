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
  "group relative inline-flex cursor-pointer items-center gap-2 text-[0.9375rem] font-medium text-muted no-underline transition-colors duration-200 hover:text-navy";
const navLinkActive =
  "group relative inline-flex cursor-pointer items-center gap-2 text-[0.9375rem] font-semibold text-navy no-underline transition-colors duration-200";

const navLinkLabel =
  "relative inline-block after:pointer-events-none after:absolute after:right-0 after:bottom-[-3px] after:left-0 after:h-[1.5px] after:origin-left after:scale-x-0 after:rounded-full after:bg-cyan after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:after:scale-x-100";
const navLinkLabelActive =
  "relative inline-block after:pointer-events-none after:absolute after:right-0 after:bottom-[-3px] after:left-0 after:h-[1.5px] after:origin-left after:scale-x-100 after:rounded-full after:bg-cyan";


const startCtaClass =
  "group relative inline-flex min-h-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-cyan/25 bg-[#e0f7fa] px-[22px] py-2.5 text-[0.9375rem] font-semibold text-cyan no-underline shadow-[0_4px_12px_rgb(0_151_167/0.1)] transition-[transform,box-shadow,border-color,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] before:pointer-events-none before:absolute before:inset-0 before:origin-left before:scale-x-0 before:rounded-full before:bg-[linear-gradient(90deg,#00bcd4_0%,#00a8bf_50%,#0097a7_100%)] before:transition-transform before:duration-700 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:shadow-[0_10px_22px_rgb(0_151_167/0.38)] hover:before:scale-x-100 active:translate-y-0 active:shadow-[0_4px_12px_rgb(0_151_167/0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2";


type Props = {
  activeHref?: string;
  /** Transparent glass nav so hero gradient continues from the top of the page. */
  overHero?: boolean;
};

const desktopLinks = BF_MARKETING_NAV.filter(
  (item) => item.label !== BF_MARKETING_START_CTA_LABEL,
);

/** Desktop: classic sticky nav. Mobile: BubbleMenu. Same routes. */
export function BandForgeHeaderMarketing({ activeHref, overHero }: Props) {
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
      <header
        className={
          overHero
            ? "sticky top-0 z-30 hidden w-full border-b border-transparent bg-transparent backdrop-blur-[8px] lg:block"
            : "sticky top-0 z-30 hidden w-full border-b border-border-soft bg-white/92 backdrop-blur-[10px] lg:block lg:bg-white/90 lg:backdrop-blur-[12px]"
        }
      >        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3.5 sm:px-5 lg:px-10 lg:py-4">
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
                    <span className={active ? navLinkLabelActive : navLinkLabel}>
                      {item.label}
                    </span>
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
              <span className="relative z-[1]">{startCta.label}</span>
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
