"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BubbleMenu from "@/components/bandforge/bubble-menu";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import { BfMarketingWordmark } from "@/components/bandforge/bf-marketing-wordmark";
import { BfMarketingNavIcon } from "@/components/bandforge/bf-marketing-nav-icon";
import {
  BF_MARKETING_NAV,
  BF_MARKETING_START_CTA_LABEL,
} from "@/components/bandforge/bf-marketing-nav";
import { scrollToMarketingHash } from "@/components/bandforge/bf-scroll-to-section";
import { useMarketingStartCta } from "@/components/bandforge/bf-use-marketing-start-cta";
import { bfPrimaryCtaNavClass } from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

const navLink =
  "group relative inline-flex cursor-pointer items-center gap-2 text-[0.9375rem] font-medium text-muted no-underline transition-colors duration-200 hover:text-navy";
const navLinkActive =
  "group relative inline-flex cursor-pointer items-center gap-2 text-[0.9375rem] font-semibold text-navy no-underline transition-colors duration-200";

const navLinkLabel =
  "relative inline-block after:pointer-events-none after:absolute after:right-0 after:bottom-[-3px] after:left-0 after:h-[1.5px] after:origin-left after:scale-x-0 after:rounded-full after:bg-cyan after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:after:scale-x-100";
const navLinkLabelActive =
  "relative inline-block after:pointer-events-none after:absolute after:right-0 after:bottom-[-3px] after:left-0 after:h-[1.5px] after:origin-left after:scale-x-100 after:rounded-full after:bg-cyan";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

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
        className={cn(
          "sticky top-0 z-30 hidden w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block",
          overHero
            ? scrolled
              ? "border-b border-border-soft bg-white/70 shadow-[0_8px_24px_-18px_rgb(13_31_60/0.35)] backdrop-blur-[16px]"
              : "border-b border-transparent bg-transparent backdrop-blur-none"
            : "border-b border-border-soft bg-white/92 backdrop-blur-[6px] lg:bg-white/90 lg:backdrop-blur-[8px]",
        )}
      >
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
                    onClick={(e) => {
                      scrollToMarketingHash(item.href, e);
                    }}
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
              className={bfPrimaryCtaNavClass}
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
