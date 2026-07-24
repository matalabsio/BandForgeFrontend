import { SeoAudienceLanding } from "@/components/bandforge/seo/seo-audience-landing";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function UrduLandingExperience() {
  return (
    <SeoAudienceLanding
      activeHref="/urdu"
      eyebrow="Urdu speakers"
      title={PAGE_SEO_COPY.urdu.h1}
      description={PAGE_SEO_COPY.urdu.description}
      diagnosticHeadline="Urdu speaker? Know your band in 15 minutes — free."
      whyHeading="Why do Urdu speakers choose BandForge?"
      leadAnswer="BandForge helps Urdu-speaking students in Hyderabad and beyond find their real IELTS band before exam day — with a free diagnostic and targeted sprints from ₹999."
      body="Whether you are aiming for the UK, Canada, or the US, BandForge starts with a free section-wise diagnostic, then targets the skill that is holding your score — with AI practice plus Band 9 human review on Writing and Speaking."
      benefitsHeading="What you get"
      benefits={[
        "Free 15-minute diagnostic with section-wise bands",
        "Writing and Speaking sprints from ₹999",
        "Band 9-trained human review within 48 hours",
        "90 days access, 12 tasks, 1 mock on completion",
        "Built for Hyderabad and diaspora study-abroad routes",
        "Mobile-friendly practice anytime",
      ]}
      relatedLinks={[
        { href: "/telugu", label: "IELTS for Telugu speakers" },
        { href: "/hyderabad", label: "IELTS coaching in Hyderabad" },
        { href: "/writing", label: "Writing Sprint" },
        { href: "/speaking", label: "Speaking Sprint" },
        { href: "/faq", label: "FAQ" },
        { href: "/vs-coaching-centres", label: "vs Coaching centres" },
      ]}
    />
  );
}
