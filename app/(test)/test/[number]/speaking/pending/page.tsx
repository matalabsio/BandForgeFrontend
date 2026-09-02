import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { shortModuleSpeakingPendingPath } from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { resolveCatalogSlotServer } from "@/lib/mock-server";
import { appendPlanResultParams } from "@/lib/plan-day-tasks";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { SpeakingPendingPage } from "@/modules/speaking/components/speaking-pending-page";

export const metadata: Metadata = {
  title: "Speaking submitted · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{
    attempt?: string;
    mock_attempt?: string;
    from?: string;
    task?: string;
    taskId?: string;
    hubId?: string;
  }>;
};

export default async function TestSpeakingPendingPage({ params, searchParams }: Props) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const attemptId = sp.attempt?.trim();
  if (!attemptId) {
    redirect(`/test/${testNumber}/speaking`);
  }

  const mockAttemptId = sp.mock_attempt?.trim() || null;
  const returnPath = appendPlanResultParams(
    shortModuleSpeakingPendingPath(testNumber, attemptId, {
      mockAttemptId,
    }),
    sp.from === "plan"
      ? { task: sp.task, taskId: sp.taskId, hubId: sp.hubId }
      : null,
  );

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);

  const resolved = await resolveCatalogSlotServer(cookieHeader, testNumber);
  if (!resolved) notFound();

  return (
    <MockLayout>
      <SpeakingPendingPage
        attemptId={attemptId}
        testNumber={testNumber}
        mockTestId={resolved.mockTestId}
        mockAttemptId={mockAttemptId}
        planFrom={sp.from}
        planTask={sp.task}
        planTaskId={sp.taskId}
        planHubId={sp.hubId}
      />
    </MockLayout>
  );
}
