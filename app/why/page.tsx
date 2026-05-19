import type { Metadata } from "next";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BandForgeComparison } from "@/components/bandforge/bf-comparison";
import { BandForgeTestimonials } from "@/components/bandforge/bf-testimonials";

export const metadata: Metadata = {
  title: "Why BandForge",
  description:
    "Why BandForge is built for students who need realistic IELTS practice without relying only on expensive coaching.",
};

export default function WhyBandForgePage() {
  return (
    <BandForgeRouteShell
      eyebrow="Why BandForge"
      title="Built for serious prep without expensive coaching dependency."
      description="BandForge keeps the exam pressure real, shortens the feedback loop, and makes improvement visible for students learning mostly on their own."
    >
      <BandForgeComparison />
      <BandForgeTestimonials />
    </BandForgeRouteShell>
  );
}
