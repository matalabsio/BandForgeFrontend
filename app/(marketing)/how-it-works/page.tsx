import type { Metadata } from "next";
import { HowItWorksExperience } from "@/components/bandforge/seo/how-it-works-experience";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "How BandForge Works — Diagnostic to Band Score",
  description:
    "Six steps from free diagnostic to targeted sprints: onboard, diagnose, learn, practise, review with AI plus Band 9 feedback, and track progress.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return <HowItWorksExperience />;
}
