import type { Metadata } from "next";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BandForgeFeatures } from "@/components/bandforge/bf-features";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore BandForge features for realistic IELTS mocks, AI evaluation, speaking analysis, and personalised practice.",
};

export default function FeaturesPage() {
  return (
    <BandForgeRouteShell
      eyebrow="Core product"
      title="Everything BandForge gives your IELTS prep."
      description="A focused look at the product building blocks: full mocks, instant scoring, writing evaluation, speaking insights, and adaptive practice."
    >
      <BandForgeFeatures />
    </BandForgeRouteShell>
  );
}
