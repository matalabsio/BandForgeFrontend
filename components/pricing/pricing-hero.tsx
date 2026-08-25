"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { pricingCtaNavyClass } from "@/components/pricing/pricing-cta-styles";
import { useDiagnosticComplete } from "@/components/pricing/use-diagnostic-complete";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

const STEPS = [
  "Free 15-min diagnostic",
  "Pick your skill pack",
  "One-time Razorpay checkout",
] as const;

/** Pricing hero — conditional diagnostic CTA when baseline is missing. */
export function PricingHero() {
  const diagnosticStatus = useDiagnosticComplete();

  return (
    <section className="border-b border-border-soft bg-white">
      <div className="bf-container mx-auto max-w-[1180px] px-5 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-[1.75rem] font-bold tracking-[-0.03em] text-navy sm:text-[2.25rem]">
            {PAGE_SEO_COPY.pricing.h1}
          </h1>
          <p className="mx-auto mt-3 max-w-[44ch] text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
            One-time plans for Writing, Speaking, or all four skills. Pay once — no
            subscription.
          </p>

          {diagnosticStatus === "complete" ? (
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy">
              <Check className="size-4 text-cyan" strokeWidth={2.5} aria-hidden />
              Diagnostic complete — choose a plan below
            </p>
          ) : diagnosticStatus === "incomplete" ? (
            <Link
              href="/diagnostic"
              prefetch
              className={`${pricingCtaNavyClass} mt-5 no-underline`}
            >
              Start free diagnostic
            </Link>
          ) : null}

          <ul className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted-light sm:text-sm">
            {STEPS.map((step, index) => (
              <li key={step} className="inline-flex items-center gap-2">
                {index > 0 ? (
                  <span className="text-border-soft" aria-hidden>
                    ·
                  </span>
                ) : null}
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
