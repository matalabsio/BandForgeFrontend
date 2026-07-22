import Link from "next/link";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionHeading } from "@/components/bandforge/ui/bf-section-heading";
import { BfDiagnosticCtaBand } from "@/components/seo/bf-diagnostic-cta-band";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import { OPERATOR_NAME } from "@/lib/seo/claims";

const relatedLinks = [
  { href: "/telugu", label: "IELTS for Telugu speakers" },
  { href: "/urdu", label: "IELTS for Urdu speakers" },
  { href: "/diagnostic", label: "Free diagnostic" },
  { href: "/pricing", label: "Sprint pricing" },
] as const;

const GACHIBOWLI_MAP_EMBED =
  "https://maps.google.com/maps?q=Gachibowli%2C%20Hyderabad%2C%20Telangana&t=&z=14&ie=UTF8&iwloc=&output=embed";

export function HyderabadLandingExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/hyderabad"
      eyebrow="Hyderabad"
      title="Online IELTS coaching from Hyderabad — without the centre commute."
      description="BandForge is built by MATA Labs in Gachibowli, Hyderabad. Free diagnostic, skill sprints from ₹999, and Band 9-trained review — for TG and AP students who want flexible online prep."
      afterHero={
        <BfDiagnosticCtaBand headline="Hyderabad student? Take the free 15-minute diagnostic." />
      }
    >
        <section className="bf-section bg-white/70">
          <div className="bf-container max-w-3xl">
            <BfSectionHeading as="h2">
              Where is BandForge IELTS coaching located?
            </BfSectionHeading>
            <div className="mt-4">
              <BfSeoLeadAnswer>
                {`BandForge is operated by ${OPERATOR_NAME} from Gachibowli, Hyderabad, serving Telangana, Andhra Pradesh, and online learners across India.`}
              </BfSeoLeadAnswer>
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              You do not need to visit a classroom. Take the diagnostic and sprints
              online — the same quality feedback Hyderabad coaching centres promise,
              at sprint prices from ₹999 with a free starting point.
            </p>
          </div>
        </section>

        <section className="bf-section">
          <div className="bf-container">
            <BfSectionHeading as="h2">Why Hyderabad students choose BandForge</BfSectionHeading>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Free 15-minute diagnostic before you spend on coaching",
                "Sprints from ₹999 — Writing, Speaking, Dual, All Skills",
                "Band 9-trained human review within 48 hours",
                "Built locally in Gachibowli by MATA Labs",
                "Serves Telangana and Andhra Pradesh students online",
                "Mobile-friendly mocks and practice anytime",
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
          <div className="bf-container">
            <BfSectionHeading as="h2">Find us in Gachibowli</BfSectionHeading>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
              {OPERATOR_NAME} · Gachibowli, Hyderabad, Telangana 500032, India
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border/70">
              <iframe
                title="BandForge — Gachibowli, Hyderabad"
                src={GACHIBOWLI_MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[280px] w-full border-0 sm:h-[360px]"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="bf-section">
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
