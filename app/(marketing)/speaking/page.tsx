import type { Metadata } from "next";
import { SpeakingSprintExperience } from "@/components/bandforge/seo/speaking-sprint-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { sprintPageSchemaGraph } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.speaking.title,
  description: PAGE_SEO_COPY.speaking.description,
  path: "/speaking",
});

export default function SpeakingPage() {
  const copy = PAGE_SEO_COPY.speaking;

  return (
    <>
      <JsonLd
        data={sprintPageSchemaGraph("speaking-sprint", {
          name: copy.title,
          description: copy.description,
          path: "/speaking",
        })}
      />
      <SpeakingSprintExperience />
    </>
  );
}
