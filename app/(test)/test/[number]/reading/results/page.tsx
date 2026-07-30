import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getServerUser, resolveAuthRedirectPath } from "@/lib/auth";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-live";
import { resolveCatalogSlotServer } from "@/lib/mock-server";
import { shortModuleResultsPath } from "@/lib/module-results-path";
import { isMockSectionResultsUrl } from "@/lib/section-results-path";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { MockSectionResultsClient } from "@/modules/results/components/mock-section-results-client";
import { ModuleScoreResultsClient } from "@/modules/results/components/module-score-results-client";

export const metadata = {
  title: "Reading result",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ attempt?: string; part?: string; mock_attempt?: string }>;
};

export default async function ReadingResultsPage({ params, searchParams }: PageProps) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) {
    redirect(
      resolveAuthRedirectPath(
        shortModuleResultsPath(testNumber, "reading"),
        cookieHeader,
      ),
    );
  }

  const attemptId = sp.attempt?.trim() ?? null;
  const mockAttemptId = sp.mock_attempt?.trim() ?? null;
  const part = Number.parseInt(sp.part ?? "1", 10);
  const resolvedPart = Number.isFinite(part) && part >= 1 ? part : 1;

  const resolved = await resolveCatalogSlotServer(cookieHeader, testNumber);
  if (!resolved) notFound();

  if (isMockSectionResultsUrl(new URLSearchParams(sp as Record<string, string>))) {
    return (
      <MockLayout>
        <MockSectionResultsClient
          testNumber={testNumber}
          mockTestId={resolved.mockTestId}
          module="reading"
          attemptId={attemptId}
          part={resolvedPart}
          mockAttemptId={mockAttemptId}
          listeningPartCount={resolved.mockMeta.listeningPartCount}
          readingPassageCount={resolved.mockMeta.readingPassageCount}
          writingTaskCount={resolved.mockMeta.writingTaskCount}
          speakingMinutes={resolved.mockMeta.speakingMinutes}
        />
      </MockLayout>
    );
  }

  return (
    <ModuleScoreResultsClient
      testNumber={testNumber}
      module="reading"
      targetBand={user.target_band ?? null}
    />
  );
}
