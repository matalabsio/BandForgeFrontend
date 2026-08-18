import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { SeoSprintLandingSections } from "@/components/bandforge/seo/seo-sprint-sections";
import { FULL_SKILL_PROGRAM } from "@/lib/seo/claims";
import {
  PAGE_SEO_COPY,
  WRITING_SPRINT_LEAD_ANSWER,
} from "@/lib/seo/page-copy";

export function WritingSprintExperience() {
  const copy = PAGE_SEO_COPY.writing;

  return (
    <BandForgeRouteShell
      activeHref="/writing"
      eyebrow="Writing Sprint"
      title={copy.h1}
      description={copy.openingCopy ?? copy.description}
    >
      <SeoSprintLandingSections
        skill="Writing"
        priceInr={FULL_SKILL_PROGRAM.priceInr}
        leadQuestion="What is the BandForge Writing Sprint?"
        leadAnswer={WRITING_SPRINT_LEAD_ANSWER}
        skillDetail="Each task mirrors real IELTS Task 1 and Task 2 formats. You submit essays, receive criterion-level feedback, and track whether your band is moving before exam day."
      />
      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
