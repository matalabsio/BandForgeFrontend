import type { Metadata } from "next";
import { HowItWorksExperience } from "@/components/bandforge/seo/how-it-works-experience";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "The BandForge Method — Personalised Study Plan in Six Steps",
  description:
    "No two students prep the same way. Built by a Gold Medallist and Band 9 scorer — a personalised study plan in six steps that catches where students plateau.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return <HowItWorksExperience />;
}
