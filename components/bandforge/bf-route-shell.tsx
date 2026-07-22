import type { ReactNode } from "react";
import Link from "next/link";
import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
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
        <section className="relative overflow-hidden border-b border-border/70 py-16 sm:py-20 lg:py-24">
          <div className="pointer-events-none absolute -left-24 top-16 size-72 rounded-full bg-teal/10 blur-[90px]" />
          <div className="bf-container relative">
            <Link
              href="/"
              prefetch
              className="inline-flex cursor-pointer rounded-full border border-border bg-white/80 px-3 py-1 text-meta font-semibold text-ink/60 transition-colors duration-200 hover:text-navy"
            >
              Back to home
            </Link>
            {lastUpdated ? (
              <div className="mt-8">
                <BfLastUpdated date={lastUpdated} />
              </div>
            ) : null}
            <p className={lastUpdated ? "bf-eyebrow mt-4" : "bf-eyebrow mt-8"}>
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-[1] tracking-[-0.06em] text-navy sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="bf-copy mt-6 max-w-2xl text-base sm:text-lg">
              {description}
            </p>
            {heroCta ? <div className="mt-8">{heroCta}</div> : null}
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
