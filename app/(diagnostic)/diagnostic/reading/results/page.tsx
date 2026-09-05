import { DiagnosticSectionResultsClient } from "@/components/diagnostic/diagnostic-section-results-client";

export const metadata = {
  title: "Diagnostic Reading results",
  robots: { index: false, follow: false },
};

/** Legacy bookmark — redirects into the live diagnostic journey (no section scores). */
export default function DiagnosticReadingResultsPage() {
  return <DiagnosticSectionResultsClient module="reading" />;
}
