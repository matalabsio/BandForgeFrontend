import type { Metadata } from "next";
import { DiagnosticWritingExperience } from "@/components/diagnostic/diagnostic-writing-experience";

export const metadata: Metadata = {
  title: "Diagnostic Writing · BandForge",
  robots: { index: false, follow: false },
};

export default function DiagnosticWritingPage() {
  return <DiagnosticWritingExperience />;
}
