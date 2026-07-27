import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import { SeoPrimaryCta } from "@/components/seo/seo-cta-button";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

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

/** Shared responsive layout for Telugu / Urdu / Hyderabad SEO landings. */
export function SeoAudienceLanding({
  activeHref,
  eyebrow,
  title,
  description,
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
      heroCta={
        <SeoPrimaryCta href={diagnosticPaths.landing}>{heroCtaLabel}</SeoPrimaryCta>
      }
    >
      <section className="border-b border-border-soft bg-white py-10 sm:py-12 lg:py-16">
        <div className="bf-container mx-auto max-w-2xl">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-navy sm:text-xl">
            {whyHeading}
          </h2>
          <div className="mt-3">
            <BfSeoLeadAnswer>{leadAnswer}</BfSeoLeadAnswer>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
            {body}
          </p>
        </div>
      </section>

      <section className="border-b border-border-soft bg-surface py-10 sm:py-12 lg:py-16">
        <div className="bf-container mx-auto max-w-2xl">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-navy sm:text-xl">
            {benefitsHeading}
          </h2>
          <ul className="mt-5 space-y-3">
            {benefits.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                  <Check className="size-3" strokeWidth={2.75} aria-hidden />
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

      {relatedLinks.length > 0 ? (
        <section className="bg-white py-10 sm:py-12 lg:py-16">
          <div className="bf-container mx-auto max-w-2xl">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-navy sm:text-xl">
              Related
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch
                    className="text-sm font-medium text-[#0097a7] no-underline transition-colors hover:text-[#00bcd4]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
