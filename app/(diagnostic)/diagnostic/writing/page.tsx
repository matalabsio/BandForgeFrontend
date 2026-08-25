import type { Metadata } from "next";
import { DiagnosticProductiveAccessGuard } from "@/components/diagnostic/diagnostic-productive-access-guard";
import { DiagnosticWritingExperience } from "@/components/diagnostic/diagnostic-writing-experience";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

export const metadata: Metadata = {
  title: "Diagnostic Writing · BandForge",
  robots: { index: false, follow: false },
};

export default function DiagnosticWritingPage() {
  return (
    <DiagnosticProductiveAccessGuard nextPath={diagnosticPaths.writing}>
      <DiagnosticWritingExperience />
    </DiagnosticProductiveAccessGuard>
  );
}
