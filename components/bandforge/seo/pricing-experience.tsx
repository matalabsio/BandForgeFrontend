import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { PricingClient } from "@/components/pricing/pricing-client";

export function PricingExperience() {
  return (
    <div className="min-h-dvh text-ink">
      <BandForgeHeaderMarketing activeHref="/pricing" />
      <main className="bf-page-shell bg-white">
        <PricingClient />
      </main>
      <BandForgeSiteFooter />
    </div>
  );
}
