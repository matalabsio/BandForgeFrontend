import { LegacyModuleResultRedirect } from "@/modules/results/components/legacy-module-result-redirect";

export const metadata = { title: "Reading result" };

type PageProps = { params: Promise<{ attemptId: string }> };

/** Legacy UUID path → short `/test/1/reading/results`. */
export default async function LegacyReadingResultsPage({ params }: PageProps) {
  const { attemptId } = await params;
  return (
    <LegacyModuleResultRedirect
      attemptId={attemptId}
      testNumber={1}
      module="reading"
    />
  );
}
