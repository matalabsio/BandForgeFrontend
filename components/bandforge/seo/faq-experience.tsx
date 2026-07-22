import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionHeading } from "@/components/bandforge/ui/bf-section-heading";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import { FAQ_LAST_UPDATED, SITE_FAQ, faqLeadAnswer } from "@/lib/seo/faq-content";

export function FaqExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/faq"
      eyebrow="FAQ"
      title="Answers about BandForge diagnostics, sprints, and pricing."
      description="Clear answers on the free 15-minute diagnostic, sprint plans from ₹999, 90-day access, human review timelines, and who BandForge is built for."
      lastUpdated={FAQ_LAST_UPDATED}
    >
      <section className="bf-section">
        <div className="bf-container max-w-3xl">
          <div className="space-y-4">
            {SITE_FAQ.map((item) => (
              <details
                key={item.question}
                className="group bf-min-card overflow-hidden"
              >
                <summary className="cursor-pointer list-none p-5 font-display text-base font-semibold text-navy marker:content-none sm:p-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                  {item.question}
                </summary>
                <div className="border-t border-border/60 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                  <BfSeoLeadAnswer className="text-sm sm:text-base">
                    {faqLeadAnswer(item.answer)}
                  </BfSeoLeadAnswer>
                  {faqLeadAnswer(item.answer) !== item.answer ? (
                    <p className="mt-3 text-sm leading-relaxed text-ink/70 sm:text-base">
                      {item.answer.slice(faqLeadAnswer(item.answer).length).trim()}
                    </p>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bf-section bg-white/70">
        <div className="bf-container max-w-3xl text-center">
          <BfSectionHeading as="h2">Still have questions?</BfSectionHeading>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Email us at support@bandforge.study or visit the contact page for
            partnerships and product enquiries.
          </p>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
