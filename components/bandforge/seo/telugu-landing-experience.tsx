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
      leadAnswer="BandForge helps Telugu-speaking students in Andhra Pradesh and Telangana find their real IELTS band before exam day — with a free diagnostic and the Full Skill Program (Rs. 2499)."
      body="Most coaching centres treat every student the same. BandForge maps your section-wise scores first, then builds a personalised daily plan across Listening, Reading, Writing, and Speaking until your exam date."
      benefitsHeading="What you get"
      benefits={[
        "Free 15-minute diagnostic with section-wise bands",
        "Full Skill Program — all four skills for Rs. 2499",
        "Band 9-trained human review within 48 hours",
        "90 days access, 12 tasks, 1 mock on completion",
        "Mobile-friendly — study between classes or work",
        "Built in Hyderabad for AP and TG students",
      ]}
      relatedLinks={[
        { href: "/urdu", label: "Urdu speakers" },
        { href: "/hyderabad", label: "Hyderabad" },
        { href: "/faq", label: "FAQ" },
        { href: "/vs-coaching-centres", label: "vs Coaching" },
        { href: "/blog", label: "Blog" },
      ]}
    />
  );
}
