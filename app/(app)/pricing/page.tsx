import { PricingClient } from "@/components/pricing/pricing-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Plans & pricing · BandForge",
};

export default function PricingPage() {
  return <PricingClient />;
}
