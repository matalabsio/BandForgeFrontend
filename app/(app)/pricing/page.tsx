import type { Metadata } from "next";
import { PricingClient } from "@/components/pricing/pricing-client";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { pricingSchemaGraph } from "@/lib/seo/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "BandForge Pricing — IELTS Sprints From ₹999",
  description:
    "IELTS skill sprints from ₹999: Writing, Speaking, Dual, or All Skills. Free 15-minute diagnostic always included. Hyderabad-built for AP & TG students.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <JsonLd data={pricingSchemaGraph()} />
      <PricingClient />
    </>
  );
}
