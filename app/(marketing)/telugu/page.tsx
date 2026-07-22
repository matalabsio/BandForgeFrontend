import type { Metadata } from "next";
import { TeluguLandingExperience } from "@/components/bandforge/seo/telugu-landing-experience";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "IELTS for Telugu Speakers — Coaching Built for You",
  description:
    "IELTS prep built for Telugu-speaking students in AP and Telangana. Free 15-minute diagnostic, skill sprints from ₹999, Band 9 human review. Online from Hyderabad.",
  path: "/telugu",
});

export default function TeluguPage() {
  return <TeluguLandingExperience />;
}
