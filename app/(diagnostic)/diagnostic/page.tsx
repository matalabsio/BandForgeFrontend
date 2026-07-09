import type { Metadata } from "next";
import { DiagnosticStartExperience } from "@/components/diagnostic/diagnostic-start-experience";

export const metadata: Metadata = {
  title: "Free Diagnostic · BandForge",
  description:
    "Take the free BandForge diagnostic — Listening, Reading, Writing, and Speaking with band scores in under 50 minutes. No account required.",
};

export default async function DiagnosticLandingPage() {
  return <DiagnosticStartExperience />;
}
