import type { Metadata } from "next";
import { UrduLandingExperience } from "@/components/bandforge/seo/urdu-landing-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { webPageSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.urdu.title,
  description: PAGE_SEO_COPY.urdu.description,
  path: "/urdu",
});

export default function UrduPage() {
  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: PAGE_SEO_COPY.urdu.title,
          description: PAGE_SEO_COPY.urdu.description,
          path: "/urdu",
        })}
      />
      <UrduLandingExperience />
    </>
  );
}
