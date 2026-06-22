import type { Metadata } from "next";
import { DiagnosticSpeakingExperience } from "@/components/diagnostic/diagnostic-speaking-experience";

export const metadata: Metadata = {
  title: "Diagnostic Speaking · BandForge",
  robots: { index: false, follow: false },
};

export default function DiagnosticSpeakingPage() {
  return <DiagnosticSpeakingExperience />;
}
