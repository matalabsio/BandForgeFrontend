import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionSkeleton } from "@/components/bandforge/bf-section-skeleton";
import { pageMetadata } from "@/lib/seo/metadata";

const BandForgeHow = dynamic(
  () => import("@/components/bandforge/bf-how").then((m) => m.BandForgeHow),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgeDemo = dynamic(
  () => import("@/components/bandforge/bf-demo").then((m) => m.BandForgeDemo),
  { loading: () => <BfSectionSkeleton /> },
);

export const metadata: Metadata = pageMetadata({
  title: "How BandForge Works — Mock, Feedback, Practice",
  description:
    "Learn how BandForge moves students from full IELTS mock tests to AI-powered evaluation and targeted practice.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <BandForgeRouteShell
      eyebrow="How it works"
      title="A simple loop: mock, feedback, focused practice."
      description="The student journey stays clear: take a realistic mock, understand the band blockers, then practise exactly where the score can move."
    >
      <BandForgeHow />
      <BandForgeDemo />
    </BandForgeRouteShell>
  );
}
