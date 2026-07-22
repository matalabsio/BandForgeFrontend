import Link from "next/link";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionHeading } from "@/components/bandforge/ui/bf-section-heading";
import { BfDiagnosticCtaBand } from "@/components/seo/bf-diagnostic-cta-band";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";

const relatedLinks = [
  { href: "/telugu", label: "IELTS for Telugu speakers" },
  { href: "/hyderabad", label: "IELTS coaching in Hyderabad" },
  { href: "/writing", label: "Writing Sprint" },
  { href: "/speaking", label: "Speaking Sprint" },
] as const;

export function UrduLandingExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/urdu"
      eyebrow="Urdu speakers"
      title="Hyderabad's own IELTS platform for Urdu speakers."
      description="BandForge supports Urdu-speaking students preparing for IELTS with a free 15-minute diagnostic and skill sprints from ₹999 — built by MATA Labs in Hyderabad."
      afterHero={
        <BfDiagnosticCtaBand headline="Urdu speaker in Hyderabad? Start with a free diagnostic." />
      }
    >
        <section className="bf-section bg-white/70">
          <div className="bf-container max-w-3xl">
            <BfSectionHeading as="h2">
              Is BandForge good for Urdu-speaking IELTS students?
            </BfSectionHeading>
            <div className="mt-4">
              <BfSeoLeadAnswer>
                Yes — BandForge is built in Hyderabad for Urdu- and Telugu-speaking
                students who need section-wise band clarity before paying for coaching.
              </BfSeoLeadAnswer>
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              You get realistic mocks, AI evaluation on objective sections, and
              human Band 9 review on Writing and Speaking — without commuting to a
              coaching centre or waiting for batch feedback.
            </p>
          </div>
        </section>

        <section className="bf-section">
          <div className="bf-container">
            <BfSectionHeading as="h2">How BandForge helps Urdu speakers</BfSectionHeading>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Free diagnostic — know your band before you pay",
                "Clear feedback on Writing and Speaking blockers",
                "Practice on mobile between work or college hours",
                "Sprints from ₹999 with 90 days and 12 tasks",
                "Human review within 48 hours on submissions",
                "Online from Hyderabad — no classroom lock-in",
              ].map((item) => (
                <li
                  key={item}
                  className="bf-min-card p-4 text-sm leading-relaxed text-ink/75 sm:p-5 sm:text-base"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bf-section bg-white/70">
          <div className="bf-container max-w-3xl">
            <BfSectionHeading as="h2">Explore more</BfSectionHeading>
            <ul className="mt-6 flex flex-wrap gap-3">
              {relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch
                    className="inline-flex cursor-pointer rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-navy no-underline transition-colors hover:border-teal/40 hover:text-teal"
                  >
                    {link.label}
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
