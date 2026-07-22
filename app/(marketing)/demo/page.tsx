import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionSkeleton } from "@/components/bandforge/bf-section-skeleton";
import { pageMetadata } from "@/lib/seo/metadata";

const BandForgeDemo = dynamic(
  () => import("@/components/bandforge/bf-demo").then((m) => m.BandForgeDemo),
  { loading: () => <BfSectionSkeleton /> },
);

export const metadata: Metadata = pageMetadata({
  title: "BandForge Product Tour — Mock Test Flow",
  description:
    "A short BandForge product tour showing the mock test flow, timers, submission, and feedback dashboard.",
  path: "/demo",
});

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
