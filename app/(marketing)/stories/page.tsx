import type { Metadata } from "next";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BandForgeTestimonials } from "@/components/bandforge/bf-testimonials";

export const metadata: Metadata = {
  title: "Student Stories",
  description:
    "Student stories and testimonials from IELTS learners using realistic mocks and actionable feedback.",
};

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
