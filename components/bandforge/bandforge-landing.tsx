import { BandForgeHeader } from "@/components/bandforge/bf-header";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { BandForgeHero } from "@/components/bandforge/bf-hero";
import { BandForgeFreeTrialStrip } from "@/components/bandforge/bf-free-trial-strip";
import { BandForgeFeatures } from "@/components/bandforge/bf-features";
import { BandForgeHow } from "@/components/bandforge/bf-how";
import { BandForgeTrust } from "@/components/bandforge/bf-trust";
import { BandForgeProofTiles } from "@/components/bandforge/bf-proof-tiles";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";

export function BandForgeLanding() {
  return (
    <div className="bf-page-shell min-h-dvh text-ink">
      <BandForgeHeader />
      <main>
        <BandForgeHero />
        <BandForgeFreeTrialStrip />
        <BandForgeFeatures />
        <BandForgeHow />
        <BandForgeTrust />
        <BandForgeProofTiles />
        <BandForgeFinalCta />
      </main>
      <BandForgeSiteFooter />
    </div>
  );
}
