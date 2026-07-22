import type { Metadata } from "next";
import { PricingExperience } from "@/components/bandforge/seo/pricing-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { pricingSchemaGraph } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.pricing.title,
  description: PAGE_SEO_COPY.pricing.description,
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <JsonLd data={pricingSchemaGraph()} />
      <PricingExperience />
    </>
  );
}
