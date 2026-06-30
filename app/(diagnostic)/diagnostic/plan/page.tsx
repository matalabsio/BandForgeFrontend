import type { Metadata } from "next";
import { DiagnosticPlanRevealExperience } from "@/components/diagnostic/diagnostic-plan-reveal-experience";

export const metadata: Metadata = {
  title: "Your Study Plan · BandForge",
  robots: { index: false, follow: false },
};

export default function DiagnosticPlanRevealPage() {
  return <DiagnosticPlanRevealExperience />;
}
