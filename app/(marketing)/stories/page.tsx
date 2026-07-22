import type { Metadata } from "next";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BandForgeTestimonials } from "@/components/bandforge/bf-testimonials";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Student Stories — BandForge IELTS Learners",
  description:
    "Student stories and testimonials from IELTS learners using realistic mocks and actionable feedback.",
  path: "/stories",
});

export default function StoriesPage() {
  return (
    <BandForgeRouteShell
      eyebrow="Student stories"
      title="Confidence grows when practice feels real."
      description="Representative learner stories showing why realistic mocks and specific feedback matter before test day."
    >
      <BandForgeTestimonials />
    </BandForgeRouteShell>
  );
}
