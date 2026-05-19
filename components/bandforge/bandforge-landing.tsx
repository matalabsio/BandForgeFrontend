import { BandForgeHeader } from "@/components/bandforge/bf-header";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { BandForgeHero } from "@/components/bandforge/bf-hero";
import { BandForgeFreeTrialStrip } from "@/components/bandforge/bf-free-trial-strip";
import { BandForgeTrust } from "@/components/bandforge/bf-trust";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";

export function BandForgeLanding() {
  return (
    <div className="bf-page-shell min-h-dvh text-ink">
      <BandForgeHeader />
      <main>
        <BandForgeHero />
        <BandForgeFreeTrialStrip />
        <BandForgeTrust />
        <BandForgeFinalCta />
      </main>
      <BandForgeSiteFooter />
    </div>
  );
}
