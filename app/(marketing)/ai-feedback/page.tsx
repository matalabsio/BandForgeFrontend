import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BfSectionSkeleton } from "@/components/bandforge/bf-section-skeleton";
import { pageMetadata } from "@/lib/seo/metadata";

const BandForgePreviewsGallery = dynamic(
  () =>
    import("@/components/bandforge/bf-previews-gallery").then(
      (m) => m.BandForgePreviewsGallery,
    ),
  { loading: () => <BfSectionSkeleton /> },
);

const BandForgeAiShowcase = dynamic(
  () =>
    import("@/components/bandforge/bf-ai-showcase").then(
      (m) => m.BandForgeAiShowcase,
    ),
  { loading: () => <BfSectionSkeleton /> },
);

export const metadata: Metadata = pageMetadata({
  title: "BandForge AI Feedback — Writing & Speaking",
  description:
    "See BandForge AI evaluation previews for IELTS writing, speaking, band reports, and weak-area recommendations.",
  path: "/ai-feedback",
});

export default function AiFeedbackPage() {
  return (
    <BandForgeRouteShell
      eyebrow="AI evaluation"
      title="Feedback that tells students what to fix next."
      description="Detailed IELTS-style feedback for writing, speaking, score trends, and weak areas, presented without overwhelming the learner."
    >
      <BandForgePreviewsGallery />
      <BandForgeAiShowcase />
    </BandForgeRouteShell>
  );
}
