import { BillingClient } from "@/components/pricing/billing-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Plan & billing · BandForge",
};

export default function BillingPage() {
  return <BillingClient />;
}
