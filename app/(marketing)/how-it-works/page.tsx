import type { Metadata } from "next";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BandForgeHow } from "@/components/bandforge/bf-how";
import { BandForgeDemo } from "@/components/bandforge/bf-demo";
import { pageMetadata } from "@/lib/seo/metadata";

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
