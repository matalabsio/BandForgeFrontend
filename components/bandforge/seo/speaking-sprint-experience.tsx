import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { SeoSprintLandingSections } from "@/components/bandforge/seo/seo-sprint-sections";

export function SpeakingSprintExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/speaking"
      eyebrow="Speaking Sprint"
      title="IELTS Speaking sprint with AI analysis and human review."
      description="Practice 12 speaking tasks over 90 days with AI fluency analysis and Band 9-trained human review within 48 hours — from ₹999. Your free diagnostic shows where you stand first."
    >
      <SeoSprintLandingSections
        skill="Speaking"
        priceInr={999}
        leadQuestion="What is the BandForge Speaking Sprint?"
        leadAnswer="The Speaking Sprint is a 90-day IELTS speaking plan with 12 recorded tasks, AI pronunciation and fluency analysis, and Band 9-trained human review within 48 hours — priced at ₹999."
        skillDetail="You practice Part 1, 2, and 3 style prompts, get structured feedback on fluency and coherence, and build confidence before your real exam — without waiting for a batch schedule."
      />
      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
