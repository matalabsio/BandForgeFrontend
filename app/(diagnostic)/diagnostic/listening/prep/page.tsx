import type { Metadata } from "next";
import { DiagnosticListeningPrepExperience } from "@/components/diagnostic/diagnostic-listening-prep-experience";

export const metadata: Metadata = {
  title: "Get Ready · Diagnostic Listening",
  robots: { index: false, follow: false },
};

export default function DiagnosticListeningPrepPage() {
  return <DiagnosticListeningPrepExperience />;
}
