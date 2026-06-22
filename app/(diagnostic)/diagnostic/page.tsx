import type { Metadata } from "next";
import { DiagnosticStartExperience } from "@/components/diagnostic/diagnostic-start-experience";

export const metadata: Metadata = {
  title: "Free Diagnostic · BandForge",
  description:
    "Take the free BandForge diagnostic — Listening, Reading, and Writing with band scores. No account required.",
};

export default function DiagnosticLandingPage() {
  return <DiagnosticStartExperience />;
}
