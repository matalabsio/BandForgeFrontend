import type { Metadata } from "next";
import { VsCoachingCentresExperience } from "@/components/bandforge/seo/vs-coaching-centres-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { webPageSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.vsCoachingCentres.title,
  description: PAGE_SEO_COPY.vsCoachingCentres.description,
  path: "/vs-coaching-centres",
});

export default function VsCoachingCentresPage() {
  const copy = PAGE_SEO_COPY.vsCoachingCentres;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            webPageSchema({
              name: copy.title,
              description: copy.description,
              path: "/vs-coaching-centres",
            }),
          ],
        }}
      />
      <VsCoachingCentresExperience />
    </>
  );
}
