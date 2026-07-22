import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionHeading } from "@/components/bandforge/ui/bf-section-heading";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import { FAQ_LAST_UPDATED, SITE_FAQ } from "@/lib/seo/faq-content";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function FaqExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/faq"
      eyebrow="FAQ"
      title={PAGE_SEO_COPY.faq.h1}
      description={PAGE_SEO_COPY.faq.description}
      lastUpdated={FAQ_LAST_UPDATED}
    >
      <section className="bf-section">
        <div className="bf-container max-w-3xl">
          <div className="space-y-8">
            {SITE_FAQ.map((item) => (
              <article key={item.question} className="bf-min-card overflow-hidden">
                <h2 className="border-b border-border/60 p-5 font-display text-base font-semibold text-navy sm:p-6 sm:text-lg">
                  {item.question}
                </h2>
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                  <BfSeoLeadAnswer className="text-sm sm:text-base">
                    {item.leadAnswer}
                  </BfSeoLeadAnswer>
                  {item.detail ? (
                    <p className="mt-3 text-sm leading-relaxed text-ink/70 sm:text-base">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
              </article>
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
