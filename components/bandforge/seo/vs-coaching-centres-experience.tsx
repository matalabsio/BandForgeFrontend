import { Check, X } from "lucide-react";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import { SeoPrimaryCta } from "@/components/seo/seo-cta-button";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  FULL_SKILL_PROGRAM,
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
    bandforge: `Free diagnostic; Full Skill Program ${formatPriceInr(FULL_SKILL_PROGRAM.priceInr)}`,
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

export function VsCoachingCentresExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/vs-coaching-centres"
      eyebrow="Honest comparison"
      title={PAGE_SEO_COPY.vsCoachingCentres.h1}
      description={PAGE_SEO_COPY.vsCoachingCentres.description}
      heroCta={
        <SeoPrimaryCta href={diagnosticPaths.landing}>
          Take free diagnostic
        </SeoPrimaryCta>
      }
    >
      <section className="border-b border-border-soft bg-white py-10 sm:py-12 lg:py-16">
        <div className="bf-container mx-auto max-w-2xl">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-navy sm:text-xl">
            Is online IELTS prep better than coaching centres?
          </h2>
          <div className="mt-3">
            <BfSeoLeadAnswer>
              It depends on your schedule and budget — BandForge suits students
              who want a free diagnostic first, faster feedback, and the Full Skill
              Program at Rs. 2499 without a long classroom commitment.
            </BfSeoLeadAnswer>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
            Coaching centres still help students who want in-person discipline.
            BandForge complements or replaces that model when you need flexible
            online practice with human review on Writing and Speaking.
          </p>
        </div>
      </section>

      <section className="border-b border-border-soft bg-surface py-10 sm:py-12 lg:py-16">
        <div className="bf-container mx-auto max-w-4xl">
          <h2 className="font-display text-center text-lg font-bold tracking-[-0.02em] text-navy sm:text-xl">
            Side-by-side comparison
          </h2>

          <ul className="mt-6 space-y-3 md:hidden">
            {comparisonRows.map((row) => (
              <li
                key={row.factor}
                className="overflow-hidden rounded-2xl border border-border-soft bg-white"
              >
                <p className="border-b border-border-soft bg-navy/[0.03] px-4 py-2.5 font-display text-sm font-semibold text-navy">
                  {row.factor}
                </p>
                <div className="grid gap-0 divide-y divide-border-soft">
                  <div className="flex gap-3 px-4 py-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ink/5 text-muted-light">
                      <X className="size-3" strokeWidth={2.5} aria-hidden />
                    </span>
                    <div>
                      <p className="text-[0.625rem] font-semibold tracking-wide text-muted-light uppercase">
                        Coaching
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-[#5a6b7d]">
                        {row.coaching}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-cyan/[0.04] px-4 py-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                      <Check className="size-3" strokeWidth={2.75} aria-hidden />
                    </span>
                    <div>
                      <p className="text-[0.625rem] font-semibold tracking-wide text-cyan uppercase">
                        BandForge
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-navy">
                        {row.bandforge}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-border-soft bg-white md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-soft bg-navy/[0.03]">
                  <th className="px-4 py-3 font-display font-semibold text-navy lg:px-5">
                    Factor
                  </th>
                  <th className="px-4 py-3 font-display font-semibold text-muted lg:px-5">
                    Traditional coaching
                  </th>
                  <th className="px-4 py-3 font-display font-semibold text-cyan lg:px-5">
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
                    <th className="px-4 py-3 align-top font-medium text-navy lg:px-5">
                      {row.factor}
                    </th>
                    <td className="px-4 py-3 align-top leading-relaxed text-muted lg:px-5">
                      {row.coaching}
                    </td>
                    <td className="bg-cyan/[0.03] px-4 py-3 align-top leading-relaxed text-navy lg:px-5">
                      {row.bandforge}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
