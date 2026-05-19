import type { ReactNode } from "react";
import Link from "next/link";
import { BandForgeHeader } from "@/components/bandforge/bf-header";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";

type BandForgeRouteShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function BandForgeRouteShell({
  eyebrow,
  title,
  description,
  children,
}: BandForgeRouteShellProps) {
  return (
    <div className="bf-page-shell min-h-dvh text-ink">
      <BandForgeHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border/70 py-16 sm:py-20 lg:py-24">
          <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-teal/10 blur-[90px]" />
          <div className="bf-container relative">
            <Link
              href="/"
              className="inline-flex cursor-pointer rounded-full border border-border bg-white/80 px-3 py-1 text-meta font-semibold text-ink/60 transition-colors duration-200 hover:text-navy"
            >
              Back to home
            </Link>
            <p className="bf-eyebrow mt-8">{eyebrow}</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-[1] tracking-[-0.06em] text-navy sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="bf-copy mt-6 max-w-2xl text-base sm:text-lg">
              {description}
            </p>
          </div>
        </section>
        {children}
      </main>
      <BandForgeSiteFooter />
    </div>
  );
}
