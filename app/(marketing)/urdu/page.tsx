import type { Metadata } from "next";
import { UrduLandingExperience } from "@/components/bandforge/seo/urdu-landing-experience";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "IELTS for Urdu Speakers — Hyderabad's Own Platform",
  description:
    "IELTS preparation for Urdu-speaking students in Hyderabad and Telangana. Free diagnostic, sprints from ₹999, AI plus Band 9 human review within 48 hours.",
  path: "/urdu",
});

export default function UrduPage() {
  return <UrduLandingExperience />;
}
