import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfDiagnosticCtaBand } from "@/components/seo/bf-diagnostic-cta-band";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  HUMAN_REVIEW_SLA,
  formatPriceInr,
} from "@/lib/seo/claims";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

type ComparisonRow = {
  factor: string;
  coaching: string;
  bandforge: string;
};

const comparisonRows: ComparisonRow[] = [
  {
    factor: "Starting cost",
    coaching: "₹15,000–₹40,000+ for classroom bundles",
    bandforge: `Free diagnostic; sprints from ${formatPriceInr(999)}`,
  },
  {
    factor: "Feedback speed",
    coaching: "Often batch-based — days between submissions",
    bandforge: `Band 9 human review ${HUMAN_REVIEW_SLA}; AI instant on objective sections`,
  },
  {
    factor: "Personalisation",
    coaching: "Same worksheets for the whole batch",
    bandforge: "Section-wise diagnostic first, then skill-specific sprint tasks",
  },
  {
    factor: "Mock test access",
    coaching: "Limited slots tied to centre schedule",
    bandforge: "1 full mock unlocked when you complete all 12 sprint tasks",
  },
  {
    factor: "Mobile access",
    coaching: "Mostly classroom-first with handouts",
    bandforge: "Mobile-friendly mocks and practice anytime",
  },
  {
    factor: "Know your band first",
    coaching: "Often pay before a baseline test",
    bandforge: `Free ${DIAGNOSTIC_DURATION_MINUTES}-minute diagnostic with section-wise scores`,
  },
];

function HeroCtas() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href={diagnosticPaths.landing}
        prefetch
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-brand-sky-hover"
      >
        Take free diagnostic
        <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
      </Link>
      <Link
        href="/pricing"
        prefetch
        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-white px-6 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40"
      >
        View sprint pricing
      </Link>
    </div>
  );
}

export function VsCoachingCentresExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/vs-coaching-centres"
      eyebrow="Honest comparison"
      title={PAGE_SEO_COPY.vsCoachingCentres.h1}
      description={PAGE_SEO_COPY.vsCoachingCentres.description}
      heroCta={<HeroCtas />}
      afterHero={
        <BfDiagnosticCtaBand headline="Comparing coaching options? Start with a free band check." />
      }
    >
      <section className="border-b border-border-soft bg-white bf-section">
        <div className="bf-container mx-auto max-w-3xl">
          <h2 className="font-display text-xl font-bold text-navy sm:text-2xl">
            Is online IELTS prep better than coaching centres?
          </h2>
          <div className="mt-4">
            <BfSeoLeadAnswer>
              It depends on your schedule and budget — BandForge suits students
              who want a free diagnostic first, faster feedback, and sprints from
              ₹999 without a long classroom commitment.
            </BfSeoLeadAnswer>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Coaching centres still help students who want in-person discipline.
            BandForge complements or replaces that model when you need flexible
            online practice with human review on Writing and Speaking.
          </p>
        </div>
      </section>

      <section className="border-b border-border-soft bg-surface bf-section">
        <div className="bf-container">
          <h2 className="font-display text-center text-xl font-bold text-navy sm:text-2xl">
            Side-by-side comparison
          </h2>

          {/* Mobile: stacked cards */}
          <ul className="mt-8 space-y-4 md:hidden">
            {comparisonRows.map((row) => (
              <li
                key={row.factor}
                className="overflow-hidden rounded-[1.125rem] border border-border-soft bg-white"
              >
                <p className="border-b border-border-soft bg-navy/[0.03] px-4 py-3 font-display text-sm font-semibold text-navy">
                  {row.factor}
                </p>
                <div className="grid gap-0 divide-y divide-border-soft">
                  <div className="flex gap-3 px-4 py-3.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink/5 text-muted-light">
                      <X className="size-3.5" strokeWidth={2.5} aria-hidden />
                    </span>
                    <div>
                      <p className="text-[0.6875rem] font-semibold tracking-wide text-muted-light uppercase">
                        Traditional coaching
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[#5a6b7d]">
                        {row.coaching}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-cyan/[0.04] px-4 py-3.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                      <Check className="size-3.5" strokeWidth={2.75} aria-hidden />
                    </span>
                    <div>
                      <p className="text-[0.6875rem] font-semibold tracking-wide text-cyan uppercase">
                        BandForge
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-navy">
                        {row.bandforge}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="mt-8 hidden overflow-hidden rounded-[1.25rem] border border-border-soft bg-white md:block">
            <table className="w-full border-collapse text-left text-sm lg:text-base">
              <thead>
                <tr className="border-b border-border-soft bg-navy/[0.03]">
                  <th className="px-5 py-4 font-display font-semibold text-navy lg:px-6">
                    Factor
                  </th>
                  <th className="px-5 py-4 font-display font-semibold text-muted lg:px-6">
                    Traditional coaching
                  </th>
                  <th className="px-5 py-4 font-display font-semibold text-cyan lg:px-6">
                    BandForge
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.factor}
                    className="border-b border-border-soft last:border-b-0"
                  >
                    <th className="px-5 py-4 align-top font-medium text-navy lg:px-6">
                      {row.factor}
                    </th>
                    <td className="px-5 py-4 align-top leading-relaxed text-muted lg:px-6">
                      {row.coaching}
                    </td>
                    <td className="bg-cyan/[0.03] px-5 py-4 align-top leading-relaxed text-navy lg:px-6">
                      {row.bandforge}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bf-section bg-white">
        <div className="bf-container mx-auto max-w-3xl">
          <h2 className="font-display text-xl font-bold text-navy sm:text-2xl">
            Who should start with the free diagnostic?
          </h2>
          <div className="mt-4">
            <BfSeoLeadAnswer>
              Anyone comparing coaching options should take the free 15-minute
              diagnostic first — you get section-wise band scores before spending
              on a centre or a sprint.
            </BfSeoLeadAnswer>
          </div>
          <div className="mt-8">
            <Link
              href={diagnosticPaths.landing}
              prefetch
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-brand-sky-hover"
            >
              Start free diagnostic
              <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
