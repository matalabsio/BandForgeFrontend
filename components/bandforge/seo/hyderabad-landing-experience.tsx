import { SeoAudienceLanding } from "@/components/bandforge/seo/seo-audience-landing";
import { OPERATOR_NAME } from "@/lib/seo/claims";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

const GACHIBOWLI_MAP_EMBED =
  "https://maps.google.com/maps?q=Gachibowli%2C%20Hyderabad%2C%20Telangana&t=&z=14&ie=UTF8&iwloc=&output=embed";

export function HyderabadLandingExperience() {
  return (
    <SeoAudienceLanding
      activeHref="/hyderabad"
      eyebrow="Hyderabad"
      title={PAGE_SEO_COPY.hyderabad.h1}
      description={PAGE_SEO_COPY.hyderabad.description}
      diagnosticHeadline="Hyderabad student? Take the free 15-minute diagnostic."
      whyHeading="Where is BandForge IELTS coaching located?"
      leadAnswer={`${OPERATOR_NAME} operates BandForge from Gachibowli, Hyderabad — serving Telangana, Andhra Pradesh, and online learners across India.`}
      body="You do not need to visit a classroom. Take the diagnostic and sprints online — the same quality feedback Hyderabad coaching centres promise, at sprint prices from ₹999 with a free starting point."
      benefitsHeading="Why Hyderabad students choose BandForge"
      benefits={[
        "Free 15-minute diagnostic before you spend on coaching",
        "Sprints from ₹999 — Writing, Speaking, Dual, All Skills",
        "Band 9-trained human review within 48 hours",
        "Built locally in Gachibowli by MATA Labs",
        "Serves Telangana and Andhra Pradesh students online",
        "Mobile-friendly mocks and practice anytime",
      ]}
      relatedLinks={[
        { href: "/telugu", label: "Telugu speakers" },
        { href: "/urdu", label: "Urdu speakers" },
        { href: "/faq", label: "FAQ" },
        { href: "/vs-coaching-centres", label: "vs Coaching" },
        { href: "/blog", label: "Blog" },
      ]}
      afterBenefits={
        <section className="border-b border-border-soft bg-white py-10 sm:py-12 lg:py-16">
          <div className="bf-container mx-auto max-w-2xl">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-navy sm:text-xl">
              Find us in Gachibowli
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
              {OPERATOR_NAME} · Gachibowli, Hyderabad, Telangana 500032, India
            </p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-border-soft">
              <iframe
                title="BandForge — Gachibowli, Hyderabad"
                src={GACHIBOWLI_MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[220px] w-full border-0 sm:h-[280px]"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      }
    />
  );
}
