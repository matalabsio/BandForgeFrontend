import dynamic from "next/dynamic";
import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeHero } from "@/components/bandforge/bf-hero";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { BfSectionSkeleton } from "@/components/bandforge/bf-section-skeleton";

const BandForgeStatsBar = dynamic(
  () =>
    import("@/components/bandforge/bf-stats-bar").then(
      (m) => m.BandForgeStatsBar,
    ),
  { loading: () => <BfSectionSkeleton className="min-h-[120px]" /> },
);

const BandForgeHow = dynamic(
  () => import("@/components/bandforge/bf-how").then((m) => m.BandForgeHow),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgeModules = dynamic(
  () =>
    import("@/components/bandforge/bf-modules").then((m) => m.BandForgeModules),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgeFeatures = dynamic(
  () =>
    import("@/components/bandforge/bf-features").then(
      (m) => m.BandForgeFeatures,
    ),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgeAiShowcase = dynamic(
  () =>
    import("@/components/bandforge/bf-ai-showcase").then(
      (m) => m.BandForgeAiShowcase,
    ),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgePricing = dynamic(
  () =>
    import("@/components/bandforge/bf-pricing").then(
      (m) => m.BandForgePricing,
    ),
  { loading: () => <BfSectionSkeleton /> },
);

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
