import { SeoAudienceLanding } from "@/components/bandforge/seo/seo-audience-landing";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function TeluguLandingExperience() {
  return (
    <SeoAudienceLanding
      activeHref="/telugu"
      eyebrow="Telugu speakers"
      title={PAGE_SEO_COPY.telugu.h1}
      description={PAGE_SEO_COPY.telugu.description}
      diagnosticHeadline="Telugu speaker? Know your band in 15 minutes — free."
      whyHeading="Why do Telugu speakers choose BandForge?"
      leadAnswer="BandForge helps Telugu-speaking students in Andhra Pradesh and Telangana find their real IELTS band before exam day — with a free diagnostic and targeted sprints from ₹999."
      body="Most coaching centres treat every student the same. BandForge maps your section-wise scores first, then gives you 12 focused tasks in the skill that is actually blocking your band — Writing, Speaking, or both."
      benefitsHeading="What you get"
      benefits={[
        "Free 15-minute diagnostic with section-wise bands",
        "Writing and Speaking sprints from ₹999",
        "Band 9-trained human review within 48 hours",
        "90 days access, 12 tasks, 1 mock on completion",
        "Mobile-friendly — study between classes or work",
        "Built in Hyderabad for AP and TG students",
      ]}
      relatedLinks={[
        { href: "/urdu", label: "IELTS for Urdu speakers" },
        { href: "/hyderabad", label: "IELTS coaching in Hyderabad" },
        { href: "/writing", label: "Writing Sprint" },
        { href: "/speaking", label: "Speaking Sprint" },
        { href: "/faq", label: "FAQ" },
        { href: "/vs-coaching-centres", label: "vs Coaching centres" },
      ]}
    />
  );
}
