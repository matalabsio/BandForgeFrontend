import { DiagnosticSectionResultsClient } from "@/components/diagnostic/diagnostic-section-results-client";

export const metadata = {
  title: "Diagnostic Reading results",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ completed?: string }>;
};

export default async function DiagnosticReadingResultsPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;
  const fromCompleted = sp.completed === "1";

  return (
    <DiagnosticSectionResultsClient module="reading" fromCompleted={fromCompleted} />
  );
}
