import { LegacyModuleResultRedirect } from "@/modules/results/components/legacy-module-result-redirect";

export const metadata = { title: "Speaking Feedback · BandForge" };

type PageProps = { params: Promise<{ attemptId: string }> };

/** Legacy UUID path → short `/test/1/speaking/results`. */
export default async function LegacySpeakingResultsPage({ params }: PageProps) {
  const { attemptId } = await params;
  return (
    <LegacyModuleResultRedirect
      attemptId={attemptId}
      testNumber={1}
      module="speaking"
    />
  );
}
