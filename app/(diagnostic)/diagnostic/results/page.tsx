import type { Metadata } from "next";
import { DiagnosticResultsExperience } from "@/components/diagnostic/diagnostic-results-experience";

export const metadata: Metadata = {
  title: "Diagnostic Results · BandForge",
  robots: { index: false, follow: false },
};

export default function DiagnosticResultsPage() {
  return <DiagnosticResultsExperience />;
}
