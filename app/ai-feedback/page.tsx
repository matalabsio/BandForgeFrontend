import type { Metadata } from "next";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BandForgePreviewsGallery } from "@/components/bandforge/bf-previews-gallery";
import { BandForgeAiShowcase } from "@/components/bandforge/bf-ai-showcase";

export const metadata: Metadata = {
  title: "AI Feedback",
  description:
    "See BandForge AI evaluation previews for IELTS writing, speaking, band reports, and weak-area recommendations.",
};

export default function AiFeedbackPage() {
  return (
    <BandForgeRouteShell
      eyebrow="AI evaluation"
      title="Feedback that tells students what to fix next."
      description="Detailed IELTS-style feedback for writing, speaking, score trends, and weak areas, presented without overwhelming the learner."
    >
      <BandForgePreviewsGallery />
      <BandForgeAiShowcase />
    </BandForgeRouteShell>
  );
}
