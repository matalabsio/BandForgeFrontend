import { LegacyModuleResultRedirect } from "@/modules/results/components/legacy-module-result-redirect";

export const metadata = {
  title: "Listening result",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ attemptId: string }> };

/** Legacy UUID path → short `/test/1/listening/results`. */
export default async function LegacyListeningResultsPage({ params }: PageProps) {
  const { attemptId } = await params;
  return (
    <LegacyModuleResultRedirect
      attemptId={attemptId}
      testNumber={1}
      module="listening"
    />
  );
}
