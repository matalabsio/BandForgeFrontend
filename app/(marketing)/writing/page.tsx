import type { Metadata } from "next";
import { WritingSprintExperience } from "@/components/bandforge/seo/writing-sprint-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { sprintPageSchemaGraph } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.writing.title,
  description: PAGE_SEO_COPY.writing.description,
  path: "/writing",
});

export default function WritingPage() {
  const copy = PAGE_SEO_COPY.writing;

  return (
    <>
      <JsonLd
        data={sprintPageSchemaGraph("writing-sprint", {
          name: copy.title,
          description: copy.description,
          path: "/writing",
        })}
      />
      <WritingSprintExperience />
    </>
  );
}
