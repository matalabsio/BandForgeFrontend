import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfDiagnosticCtaBand } from "@/components/seo/bf-diagnostic-cta-band";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { cn } from "@/lib/utils";

export type SeoAudienceLandingProps = {
  activeHref: string;
  eyebrow: string;
  title: string;
  description: string;
  diagnosticHeadline: string;
  whyHeading: string;
  leadAnswer: string;
  body: string;
  benefitsHeading: string;
  benefits: readonly string[];
  relatedLinks: readonly { href: string; label: string }[];
  /** Optional block after benefits (e.g. map). */
  afterBenefits?: ReactNode;
  heroCtaLabel?: string;
};

function HeroCtas({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href={diagnosticPaths.landing}
        prefetch
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-brand-sky-hover"
      >
        {label}
        <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
      </Link>
      <Link
        href="/pricing"
        prefetch
        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-white px-6 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40"
      >
        View pricing
      </Link>
    </div>
  );
}

/** Shared responsive layout for Telugu / Urdu / Hyderabad SEO landings. */
export function SeoAudienceLanding({
  activeHref,
  eyebrow,
  title,
  description,
  diagnosticHeadline,
  whyHeading,
  leadAnswer,
  body,
  benefitsHeading,
  benefits,
  relatedLinks,
  afterBenefits,
  heroCtaLabel = "Take free diagnostic",
}: SeoAudienceLandingProps) {
  return (
    <BandForgeRouteShell
      activeHref={activeHref}
      eyebrow={eyebrow}
      title={title}
      description={description}
      heroCta={<HeroCtas label={heroCtaLabel} />}
      afterHero={<BfDiagnosticCtaBand headline={diagnosticHeadline} />}
    >
      <section className="border-b border-border-soft bg-white bf-section">
        <div className="bf-container mx-auto max-w-3xl">
          <h2 className="font-display text-xl font-bold text-navy sm:text-2xl">
            {whyHeading}
          </h2>
          <div className="mt-4">
            <BfSeoLeadAnswer>{leadAnswer}</BfSeoLeadAnswer>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            {body}
          </p>
        </div>
      </section>

      <section className="border-b border-border-soft bg-surface bf-section">
        <div className="bf-container">
          <h2 className="font-display text-center text-xl font-bold text-navy sm:text-2xl">
            {benefitsHeading}
          </h2>
          <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:gap-4">
            {benefits.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-[1.125rem] border border-border-soft bg-white p-4 sm:p-5"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                  <Check className="size-3.5" strokeWidth={2.75} aria-hidden />
                </span>
                <span className="text-sm leading-relaxed text-[#3f4f63] sm:text-[0.9375rem]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {afterBenefits}

      <section className="bf-section bg-white">
        <div className="bf-container mx-auto max-w-3xl">
          <h2 className="font-display text-xl font-bold text-navy sm:text-2xl">
            Explore more
          </h2>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch
                  className={cn(
                    "flex h-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3.5 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40 hover:bg-white",
                  )}
                >
                  {link.label}
                  <ArrowRight className="size-4 shrink-0 text-cyan" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
