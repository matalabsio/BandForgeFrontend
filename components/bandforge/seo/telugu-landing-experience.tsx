import Link from "next/link";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionHeading } from "@/components/bandforge/ui/bf-section-heading";
import { BfDiagnosticCtaBand } from "@/components/seo/bf-diagnostic-cta-band";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";

const relatedLinks = [
  { href: "/urdu", label: "IELTS for Urdu speakers" },
  { href: "/hyderabad", label: "IELTS coaching in Hyderabad" },
  { href: "/writing", label: "Writing Sprint" },
  { href: "/speaking", label: "Speaking Sprint" },
] as const;

export function TeluguLandingExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/telugu"
      eyebrow="Telugu speakers"
      title="IELTS prep built for Telugu speakers in AP and Telangana."
      description="BandForge is designed for students who think in Telugu and test in English. Start with a free 15-minute diagnostic, then train with skill sprints from ₹999 — online, from Hyderabad."
      afterHero={
        <BfDiagnosticCtaBand headline="Telugu speaker? Know your band in 15 minutes — free." />
      }
    >
        <section className="bf-section bg-white/70">
          <div className="bf-container max-w-3xl">
            <BfSectionHeading as="h2">
              Why do Telugu speakers choose BandForge?
            </BfSectionHeading>
            <div className="mt-4">
              <BfSeoLeadAnswer>
                BandForge helps Telugu-speaking students in Andhra Pradesh and
                Telangana find their real IELTS band before exam day — with a
                free diagnostic and targeted sprints from ₹999.
              </BfSeoLeadAnswer>
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              Most coaching centres treat every student the same. BandForge maps
              your section-wise scores first, then gives you 12 focused tasks in
              the skill that is actually blocking your band — Writing, Speaking,
              or both.
            </p>
          </div>
        </section>

        <section className="bf-section">
          <div className="bf-container">
            <BfSectionHeading as="h2">What you get</BfSectionHeading>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Free 15-minute diagnostic with section-wise bands",
                "Writing and Speaking sprints from ₹999",
                "Band 9-trained human review within 48 hours",
                "90 days access, 12 tasks, 1 mock on completion",
                "Mobile-friendly — study between classes or work",
                "Built in Hyderabad for AP and TG students",
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
