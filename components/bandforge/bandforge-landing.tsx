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
  { loading: () => <BfSectionSkeleton className="min-h-[56px] sm:min-h-[88px]" /> },
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

const BandForgePricing = dynamic(
  () =>
    import("@/components/bandforge/bf-pricing").then((m) => m.BandForgePricing),
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
      <BandForgeHeaderMarketing overHero />
      <main>
        <BandForgeHero />
        <BandForgeStatsBar />
        <BandForgeHow />
        <BandForgeModules />
        <BandForgePricing />
        <BandForgeFinalCta />
      </main>
      <BandForgeSiteFooter />
    </div>
  );
}
