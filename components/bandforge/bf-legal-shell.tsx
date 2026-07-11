import type { ReactNode } from "react";
import Link from "next/link";

import { BfLegalNav } from "@/components/bandforge/bf-legal-nav";
import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";

type BfLegalShellProps = {
  title: string;
  description: string;
  lastUpdated: string;
  effectiveDate: string;
  children: ReactNode;
  callout?: ReactNode;
};

export function BfLegalShell({
  title,
  description,
  lastUpdated,
  effectiveDate,
  children,
  callout,
}: BfLegalShellProps) {
  return (
    <div className="min-h-dvh bg-white text-ink">
      <BandForgeHeaderMarketing />
      <div className="bf-page-shell">
        <main>
          <section className="border-b border-border-soft bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] py-12 sm:py-16">
            <div className="bf-container max-w-3xl">
              <Link
                href="/"
                prefetch
                className="inline-flex cursor-pointer items-center gap-1.5 text-meta font-medium text-ink/45 transition-colors duration-200 hover:text-navy"
              >
                <span aria-hidden>←</span>
                Back to home
              </Link>

              <p className="bf-eyebrow mt-8">Legal</p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] text-navy sm:text-[2.375rem] sm:leading-[1.1]">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-muted sm:text-body">
                {description}
              </p>

              <div className="mt-8">
                <BfLegalNav />
              </div>
            </div>
          </section>

          <article className="bf-container max-w-3xl pb-16 pt-10 lg:pb-24 lg:pt-12">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border-soft bg-surface-alt px-3 py-1 text-meta text-ink/50">
                Updated {lastUpdated}
              </span>
              <span className="rounded-full border border-border-soft bg-surface-alt px-3 py-1 text-meta text-ink/50">
                Effective {effectiveDate}
              </span>
            </div>

            {callout ? <div className="mt-8">{callout}</div> : null}

            <div className="mt-10 space-y-10">{children}</div>
          </article>
        </main>
        <BandForgeSiteFooter />
      </div>
    </div>
  );
}
