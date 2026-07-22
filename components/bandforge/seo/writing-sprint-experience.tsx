import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { SeoSprintLandingSections } from "@/components/bandforge/seo/seo-sprint-sections";

export function WritingSprintExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/writing"
      eyebrow="Writing Sprint"
      title="IELTS Writing sprint with Band 9 human review."
      description="12 writing tasks, 90 days of access, and Band 9-trained evaluators who review every submission within 48 hours — from ₹999. Start with the free 15-minute diagnostic."
    >
      <SeoSprintLandingSections
        skill="Writing"
        priceInr={999}
        leadQuestion="What is the BandForge Writing Sprint?"
        leadAnswer="The Writing Sprint is a 90-day IELTS writing plan with 12 tasks, instant AI feedback, and Band 9-trained human review within 48 hours — priced at ₹999 with a free diagnostic included."
        skillDetail="Each task mirrors real IELTS Task 1 and Task 2 formats. You submit essays, receive criterion-level feedback, and track whether your band is moving before exam day."
      />
      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
