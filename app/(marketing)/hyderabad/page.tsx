import type { Metadata } from "next";
import { HyderabadLandingExperience } from "@/components/bandforge/seo/hyderabad-landing-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { localBusinessSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.hyderabad.title,
  description: PAGE_SEO_COPY.hyderabad.description,
  path: "/hyderabad",
});

export default function HyderabadPage() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <HyderabadLandingExperience />
    </>
  );
}
