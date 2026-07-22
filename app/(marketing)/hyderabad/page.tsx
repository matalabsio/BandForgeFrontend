import type { Metadata } from "next";
import { HyderabadLandingExperience } from "@/components/bandforge/seo/hyderabad-landing-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { localBusinessSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: "IELTS Coaching in Hyderabad — Online | BandForge",
  description:
    "Online IELTS coaching from Gachibowli, Hyderabad. Free 15-minute diagnostic, sprints from ₹999, Band 9-trained review. Built for TG and AP students.",
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
