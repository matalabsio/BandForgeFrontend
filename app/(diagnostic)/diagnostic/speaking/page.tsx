import type { Metadata } from "next";
import { DiagnosticProductiveAccessGuard } from "@/components/diagnostic/diagnostic-productive-access-guard";
import { DiagnosticSpeakingExperience } from "@/components/diagnostic/diagnostic-speaking-experience";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

export const metadata: Metadata = {
  title: "Diagnostic Speaking · BandForge",
  robots: { index: false, follow: false },
};

export default function DiagnosticSpeakingPage() {
  return (
    <DiagnosticProductiveAccessGuard nextPath={diagnosticPaths.speaking}>
      <DiagnosticSpeakingExperience />
    </DiagnosticProductiveAccessGuard>
  );
}
