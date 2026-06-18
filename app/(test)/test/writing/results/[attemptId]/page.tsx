import { LegacyModuleResultRedirect } from "@/modules/results/components/legacy-module-result-redirect";

export const metadata = { title: "Writing Feedback · BandForge" };

type PageProps = { params: Promise<{ attemptId: string }> };

/** Legacy UUID path → short `/test/1/writing/results`. */
export default async function LegacyWritingResultsPage({ params }: PageProps) {
  const { attemptId } = await params;
  return (
    <LegacyModuleResultRedirect
      attemptId={attemptId}
      testNumber={1}
      module="writing"
    />
  );
}
