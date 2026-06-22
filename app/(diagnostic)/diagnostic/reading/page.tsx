import type { Metadata } from "next";
import { DiagnosticReadingExperience } from "@/components/diagnostic/diagnostic-reading-experience";

export const metadata: Metadata = {
  title: "Diagnostic Reading · BandForge",
  robots: { index: false, follow: false },
};

export default function DiagnosticReadingPage() {
  return <DiagnosticReadingExperience />;
}
