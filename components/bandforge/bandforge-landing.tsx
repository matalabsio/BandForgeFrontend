import dynamic from "next/dynamic";
import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeHero } from "@/components/bandforge/bf-hero";
// import { BfLandingHashScroll } from "@/components/bandforge/bf-landing-hash-scroll";
// import { BfSectionDotBridge } from "@/components/bandforge/bf-section-dot-bridge";
// import { BfSectionSeam } from "@/components/bandforge/bf-section-seam";
import { BfSectionSkeleton } from "@/components/bandforge/bf-section-skeleton";

// Temporarily hidden — product detail sections (how / modules / pricing)
// const BandForgeHow = dynamic(
//   () => import("@/components/bandforge/bf-how").then((m) => m.BandForgeHow),
//   { loading: () => <BfSectionSkeleton /> },
// );
//
// const BandForgeModules = dynamic(
//   () =>
//     import("@/components/bandforge/bf-modules").then((m) => m.BandForgeModules),
//   { loading: () => <BfSectionSkeleton /> },
// );
//
// const BandForgePricing = dynamic(
//   () =>
//     import("@/components/bandforge/bf-pricing").then((m) => m.BandForgePricing),
//   { loading: () => <BfSectionSkeleton /> },
// );

const BandForgeFinishLine = dynamic(
  () =>
    import("@/components/bandforge/bf-finish-line").then(
      (m) => m.BandForgeFinishLine,
    ),
  {
    loading: () => (
      <BfSectionSkeleton className="min-h-[480px] bg-[#08172b]" />
    ),
  },
);

/** Marketing home — BandForge IELTS landing at `/`. */
export function BandForgeLanding() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-black">
      {/* <BfLandingHashScroll /> */}
      <BandForgeHeaderMarketing overHero />
      <main>
        <BandForgeHero />
        {/* Temporarily hidden — product detail sections
        <BfSectionSeam />
        <div className="relative bg-white">
          <BandForgeHow />
          <div className="relative h-0 overflow-visible">
            <BfSectionDotBridge side="left" anchor="seam" offsetY={60} />
          </div>
          <div className="relative">
            <BandForgeModules />
            <BfSectionDotBridge side="right" anchor="center" offsetY={60} />
            <BandForgePricing />
          </div>
        </div>
        */}
        <BandForgeFinishLine />
      </main>
    </div>
  );
}
