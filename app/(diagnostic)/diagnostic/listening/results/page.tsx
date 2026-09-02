import { DiagnosticSectionResultsClient } from "@/components/diagnostic/diagnostic-section-results-client";

export const metadata = {
  title: "Diagnostic Listening results",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ completed?: string }>;
};

export default async function DiagnosticListeningResultsPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;
  const fromCompleted = sp.completed === "1";

  return (
    <DiagnosticSectionResultsClient module="listening" fromCompleted={fromCompleted} />
  );
}
