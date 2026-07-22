import type { Metadata } from "next";
import { SpeakingSprintExperience } from "@/components/bandforge/seo/speaking-sprint-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { sprintPageSchemaGraph } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: "IELTS Speaking Sprint — AI + Band 9 Review | ₹999",
  description:
    "90-day IELTS Speaking sprint: 12 tasks, AI fluency analysis, and Band 9-trained human review within 48 hours. Free diagnostic included. From ₹999.",
  path: "/speaking",
});

export default function SpeakingPage() {
  return (
    <>
      <JsonLd
        data={sprintPageSchemaGraph("speaking-sprint", {
          name: "IELTS Speaking Sprint — AI + Band 9 Review | ₹999",
          description:
            "90-day IELTS Speaking sprint with 12 tasks, AI analysis, and Band 9-trained human review within 48 hours.",
          path: "/speaking",
        })}
      />
      <SpeakingSprintExperience />
    </>
  );
}
