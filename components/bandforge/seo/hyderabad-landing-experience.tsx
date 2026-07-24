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
        { href: "/telugu", label: "IELTS for Telugu speakers" },
        { href: "/urdu", label: "IELTS for Urdu speakers" },
        { href: "/diagnostic", label: "Free diagnostic" },
        { href: "/pricing", label: "Sprint pricing" },
        { href: "/faq", label: "FAQ" },
        { href: "/vs-coaching-centres", label: "vs Coaching centres" },
      ]}
      afterBenefits={
        <section className="border-b border-border-soft bg-white bf-section">
          <div className="bf-container">
            <h2 className="font-display text-xl font-bold text-navy sm:text-2xl">
              Find us in Gachibowli
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              {OPERATOR_NAME} · Gachibowli, Hyderabad, Telangana 500032, India
            </p>
            <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-border-soft shadow-[0_16px_40px_-28px_rgb(13_31_60/0.35)]">
              <iframe
                title="BandForge — Gachibowli, Hyderabad"
                src={GACHIBOWLI_MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[240px] w-full border-0 sm:h-[320px] lg:h-[380px]"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      }
    />
  );
}
