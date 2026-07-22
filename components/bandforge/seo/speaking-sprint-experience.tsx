import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { SeoSprintLandingSections } from "@/components/bandforge/seo/seo-sprint-sections";
import {
  PAGE_SEO_COPY,
  SPEAKING_SPRINT_LEAD_ANSWER,
} from "@/lib/seo/page-copy";

export function SpeakingSprintExperience() {
  const copy = PAGE_SEO_COPY.speaking;

  return (
    <BandForgeRouteShell
      activeHref="/speaking"
      eyebrow="Speaking Sprint"
      title={copy.h1}
      description={copy.openingCopy ?? copy.description}
    >
      <SeoSprintLandingSections
        skill="Speaking"
        priceInr={999}
        leadQuestion="What is the BandForge Speaking Sprint?"
        leadAnswer={SPEAKING_SPRINT_LEAD_ANSWER}
        skillDetail="You practice Part 1, 2, and 3 style prompts, get structured feedback on fluency and coherence, and build confidence before your real exam — without waiting for a batch schedule."
      />
      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
