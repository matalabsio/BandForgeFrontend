import type { Metadata } from "next";
import { WritingSprintExperience } from "@/components/bandforge/seo/writing-sprint-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { sprintPageSchemaGraph } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: "IELTS Writing Sprint — Band 9 Feedback in 48 Hrs | ₹999",
  description:
    "90-day IELTS Writing sprint: 12 tasks, AI practice, and Band 9-trained human review within 48 hours. Free 15-minute diagnostic included. From ₹999.",
  path: "/writing",
});

export default function WritingPage() {
  return (
    <>
      <JsonLd
        data={sprintPageSchemaGraph("writing-sprint", {
          name: "IELTS Writing Sprint — Band 9 Feedback in 48 Hrs | ₹999",
          description:
            "90-day IELTS Writing sprint with 12 tasks, AI practice, and Band 9-trained human review within 48 hours.",
          path: "/writing",
        })}
      />
      <WritingSprintExperience />
    </>
  );
}
