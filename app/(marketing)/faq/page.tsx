import type { Metadata } from "next";
import { FaqExperience } from "@/components/bandforge/seo/faq-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_FAQ } from "@/lib/seo/faq-content";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqPageSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: "BandForge FAQ — Diagnostic, Sprints, Pricing",
  description:
    "Answers about BandForge's free 15-minute IELTS diagnostic, skill sprints from ₹999, 90-day access, human review within 48 hours, and Completion Guarantee.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(SITE_FAQ)} />
      <FaqExperience />
    </>
  );
}
