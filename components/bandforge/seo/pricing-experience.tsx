import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { PricingStaticOverview } from "@/components/bandforge/seo/pricing-static-overview";
import { PricingClient } from "@/components/pricing/pricing-client";

export function PricingExperience() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-ink">
      <BandForgeHeaderMarketing activeHref="/pricing" />
      <main>
        <PricingStaticOverview />
        <PricingClient />
      </main>
      <BandForgeSiteFooter />
    </div>
  );
}
