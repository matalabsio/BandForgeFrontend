import type { ReactNode } from "react";
import Link from "next/link";
import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { SeoHeroAntigravity } from "@/components/bandforge/seo/seo-hero-antigravity";
import { BfLastUpdated } from "@/components/seo/bf-last-updated";

type BandForgeRouteShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  activeHref?: string;
  heroCta?: ReactNode;
  afterHero?: ReactNode;
  lastUpdated?: string;
};

export function BandForgeRouteShell({
  eyebrow,
  title,
  description,
  children,
  activeHref,
  heroCta,
  afterHero,
  lastUpdated,
}: BandForgeRouteShellProps) {
  return (
    <div className="min-h-dvh text-ink">
      <BandForgeHeaderMarketing activeHref={activeHref} />
      <div className="bf-page-shell">
        <main>
          <section className="relative flex min-h-[calc(100dvh-4.75rem)] items-center overflow-hidden border-b border-border/70 bg-white">
            <SeoHeroAntigravity />

            <div className="bf-container relative z-10 flex w-full items-center py-12 sm:py-16 lg:py-20">
              <div className="max-w-3xl rounded-3xl bg-white/60 p-6 backdrop-blur-[2px] sm:p-8 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <Link
                href="/"
                prefetch
                className="inline-flex cursor-pointer text-sm font-medium text-ink/50 transition-colors duration-200 hover:text-navy"
              >
                ← Home
              </Link>
              {lastUpdated ? (
                <div className="mt-6">
                  <BfLastUpdated date={lastUpdated} />
                </div>
              ) : null}
              <p
                className={
                  lastUpdated ? "bf-eyebrow mt-4" : "bf-eyebrow mt-6"
                }
              >
                {eyebrow}
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-[1.875rem] font-bold leading-[1.12] tracking-[-0.04em] text-navy sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink/65 sm:text-base">
                {description}
              </p>
              {heroCta ? <div className="mt-7">{heroCta}</div> : null}
              </div>
            </div>
          </section>
          {afterHero}
          {children}
        </main>
        <BandForgeSiteFooter />
      </div>
    </div>
  );
}
