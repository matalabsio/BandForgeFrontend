import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionSkeleton } from "@/components/bandforge/bf-section-skeleton";

const BandForgeComparison = dynamic(
  () =>
    import("@/components/bandforge/bf-comparison").then(
      (m) => m.BandForgeComparison,
    ),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgeTestimonials = dynamic(
  () =>
    import("@/components/bandforge/bf-testimonials").then(
      (m) => m.BandForgeTestimonials,
    ),
  { loading: () => <BfSectionSkeleton /> },
);

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
