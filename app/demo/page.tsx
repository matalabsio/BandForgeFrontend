import type { Metadata } from "next";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BandForgeDemo } from "@/components/bandforge/bf-demo";

export const metadata: Metadata = {
  title: "Product Tour",
  description:
    "A short BandForge product tour showing the mock test flow, timers, submission, and feedback dashboard.",
};

export default function DemoPage() {
  return (
    <BandForgeRouteShell
      eyebrow="Product tour"
      title="See the mock-test flow end to end."
      description="A focused walkthrough page for navigation, timers, submission, and the feedback dashboard."
    >
      <BandForgeDemo />
    </BandForgeRouteShell>
  );
}
