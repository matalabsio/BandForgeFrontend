import type { Metadata } from "next";
import { DiagnosticProcessingExperience } from "@/components/diagnostic/diagnostic-processing-experience";

export const metadata: Metadata = {
  title: "Processing results · BandForge",
  robots: { index: false, follow: false },
};

export default function DiagnosticProcessingPage() {
  return <DiagnosticProcessingExperience />;
}
