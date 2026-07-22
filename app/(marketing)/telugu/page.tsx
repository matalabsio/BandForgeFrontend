import type { Metadata } from "next";
import { TeluguLandingExperience } from "@/components/bandforge/seo/telugu-landing-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { webPageSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.telugu.title,
  description: PAGE_SEO_COPY.telugu.description,
  path: "/telugu",
});

export default function TeluguPage() {
  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: PAGE_SEO_COPY.telugu.title,
          description: PAGE_SEO_COPY.telugu.description,
          path: "/telugu",
        })}
      />
      <TeluguLandingExperience />
    </>
  );
}
