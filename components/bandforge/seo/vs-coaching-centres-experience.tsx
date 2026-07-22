import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionHeading } from "@/components/bandforge/ui/bf-section-heading";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  HUMAN_REVIEW_SLA,
  formatPriceInr,
} from "@/lib/seo/claims";

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

export function VsCoachingCentresExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/vs-coaching-centres"
      eyebrow="Honest comparison"
      title="BandForge vs traditional IELTS coaching centres."
      description="A straightforward look at cost, feedback speed, and flexibility — so you can decide whether online sprints or classroom coaching fits your timeline and budget."
    >
      <section className="bf-section bg-white/70">
        <div className="bf-container max-w-3xl">
          <BfSectionHeading as="h2">
            Is online IELTS prep better than coaching centres?
          </BfSectionHeading>
          <div className="mt-4">
            <BfSeoLeadAnswer>
              It depends on your schedule and budget — BandForge suits students
              who want a free diagnostic first, faster feedback, and sprints from
              ₹999 without a long classroom commitment.
            </BfSeoLeadAnswer>
          </div>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Coaching centres still help students who want in-person discipline.
            BandForge complements or replaces that model when you need flexible
            online practice with human review on Writing and Speaking.
          </p>
        </div>
      </section>

      <section className="bf-section">
        <div className="bf-container overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b border-border/70">
                <th className="py-3 pr-4 font-display font-semibold text-navy">
                  Factor
                </th>
                <th className="py-3 px-4 font-display font-semibold text-ink/50">
                  Traditional coaching
                </th>
                <th className="py-3 pl-4 font-display font-semibold text-navy">
                  BandForge
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.factor} className="border-b border-border/50">
                  <th className="py-4 pr-4 align-top font-medium text-navy">
                    {row.factor}
                  </th>
                  <td className="py-4 px-4 align-top leading-relaxed text-ink/60">
                    {row.coaching}
                  </td>
                  <td className="py-4 pl-4 align-top leading-relaxed text-ink/80">
                    {row.bandforge}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bf-section bg-white/70">
        <div className="bf-container max-w-3xl">
          <BfSectionHeading as="h2">
            Who should start with the free diagnostic?
          </BfSectionHeading>
          <div className="mt-4">
            <BfSeoLeadAnswer>
              Anyone comparing coaching options should take the free 15-minute
              diagnostic first — you get section-wise band scores before spending
              on a centre or a sprint.
            </BfSeoLeadAnswer>
          </div>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
