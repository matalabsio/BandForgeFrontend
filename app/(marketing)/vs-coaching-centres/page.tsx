import type { Metadata } from "next";
import { VsCoachingCentresExperience } from "@/components/bandforge/seo/vs-coaching-centres-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { webPageSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: "BandForge vs IELTS Coaching Centres — Honest Comparison",
  description:
    "Compare BandForge online IELTS sprints with traditional coaching centres on cost, feedback speed, mocks, and mobile access. Free diagnostic included.",
  path: "/vs-coaching-centres",
});

export default function VsCoachingCentresPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            webPageSchema({
              name: "BandForge vs IELTS Coaching Centres — Honest Comparison",
              description:
                "Compare BandForge online IELTS sprints with traditional coaching centres on cost, feedback speed, mocks, and mobile access.",
              path: "/vs-coaching-centres",
            }),
          ],
        }}
      />
      <VsCoachingCentresExperience />
    </>
  );
}
