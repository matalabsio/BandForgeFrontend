import type { Metadata } from "next";
import { DiagnosticListeningExperience } from "@/components/diagnostic/diagnostic-listening-experience";

export const metadata: Metadata = {
  title: "Diagnostic Listening · BandForge",
  robots: { index: false, follow: false },
};

export default function DiagnosticListeningPage() {
  return <DiagnosticListeningExperience />;
}
