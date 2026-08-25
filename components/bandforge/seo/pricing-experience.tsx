import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingClient } from "@/components/pricing/pricing-client";
import type { Plan, Subscription } from "@/lib/payments";

type PricingExperienceProps = {
  initialPlans?: Plan[];
  initialPaymentsEnabled?: boolean;
  plansKnown?: boolean;
  initialSubscription?: Subscription | null;
};

export function PricingExperience({
  initialPlans,
  initialPaymentsEnabled,
  plansKnown,
  initialSubscription,
}: PricingExperienceProps = {}) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-ink">
      <BandForgeHeaderMarketing activeHref="/pricing" />
      <main>
        <PricingHero />
        <PricingClient
          initialPlans={initialPlans}
          initialPaymentsEnabled={initialPaymentsEnabled}
          plansKnown={plansKnown}
          initialSubscription={initialSubscription}
        />
      </main>
      <BandForgeSiteFooter />
    </div>
  );
}
