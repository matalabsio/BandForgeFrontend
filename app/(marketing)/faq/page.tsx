import type { Metadata } from "next";
import { FaqExperience } from "@/components/bandforge/seo/faq-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_FAQ } from "@/lib/seo/faq-content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { faqPageSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.faq.title,
  description: PAGE_SEO_COPY.faq.description,
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
