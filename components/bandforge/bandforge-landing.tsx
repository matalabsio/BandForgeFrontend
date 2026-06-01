import dynamic from "next/dynamic";
import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeHero } from "@/components/bandforge/bf-hero";
import { BandForgeFreeTrialStrip } from "@/components/bandforge/bf-free-trial-strip";
import { BandForgeProofTiles } from "@/components/bandforge/bf-proof-tiles";
import { BandForgeFeatures } from "@/components/bandforge/bf-features";
import { BandForgeAiShowcase } from "@/components/bandforge/bf-ai-showcase";
import { BandForgeHow } from "@/components/bandforge/bf-how";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { BfSectionSkeleton } from "@/components/bandforge/bf-section-skeleton";

const BandForgeComparison = dynamic(
  () =>
    import("@/components/bandforge/bf-comparison").then(
      (m) => m.BandForgeComparison,
    ),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgeTestimonials = dynamic(
  () =>
    import("@/components/bandforge/bf-testimonials").then(
      (m) => m.BandForgeTestimonials,
    ),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgeTrust = dynamic(
  () =>
    import("@/components/bandforge/bf-trust").then((m) => m.BandForgeTrust),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgeFinalCta = dynamic(
  () =>
    import("@/components/bandforge/bf-final-cta").then(
      (m) => m.BandForgeFinalCta,
    ),
  { loading: () => <BfSectionSkeleton className="min-h-[280px]" /> },
);

/** Marketing home — BandForge IELTS landing at `/`. */
export function BandForgeLanding() {
  return (
    <div className="min-h-dvh text-ink">
      <BandForgeHeaderMarketing />
      <div className="bf-page-shell">
      <main>
        <BandForgeHero />
        <BandForgeFreeTrialStrip />
        <BandForgeProofTiles />
        <BandForgeFeatures />
        <BandForgeAiShowcase />
        <BandForgeHow />
        <BandForgeComparison />
        <BandForgeTestimonials />
        <BandForgeTrust />
        <BandForgeFinalCta />
      </main>
      <BandForgeSiteFooter />
      </div>
    </div>
  );
}
