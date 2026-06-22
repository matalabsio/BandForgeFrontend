import dynamic from "next/dynamic";
import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeHero } from "@/components/bandforge/bf-hero";
import { BandForgeStatsBar } from "@/components/bandforge/bf-stats-bar";
import { BandForgeHow } from "@/components/bandforge/bf-how";
import { BandForgeModules } from "@/components/bandforge/bf-modules";
import { BandForgePricing } from "@/components/bandforge/bf-pricing";
import { BandForgeFeatures } from "@/components/bandforge/bf-features";
import { BandForgeAiShowcase } from "@/components/bandforge/bf-ai-showcase";
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
    <div className="min-h-dvh overflow-x-hidden bg-white text-black">
      <BandForgeHeaderMarketing />
      <main>
        <BandForgeHero />
        <BandForgeStatsBar />
        <BandForgeHow />
        <BandForgeModules />
        <BandForgeFeatures />
        <BandForgeAiShowcase />
        <BandForgeComparison />
        <BandForgeTestimonials />
        <BandForgeTrust />
        <BandForgePricing />
        <BandForgeFinalCta />
      </main>
      <BandForgeSiteFooter />
    </div>
  );
}
