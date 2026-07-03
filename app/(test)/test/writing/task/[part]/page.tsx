import { redirect } from "next/navigation";
import { resolveAuthRedirectPath } from "@/lib/auth";
import { M01_MOCK_TEST_ID } from "@/lib/mock-catalog";
import { writingTestHubPath } from "@/lib/writing-test";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";
import { WritingPage } from "@/modules/writing/components/writing-page";

type Props = {
  params: Promise<{ part: string }>;
  searchParams: Promise<{ mock_attempt?: string; auto?: string }>;
};

export default async function WritingTaskPage({ params, searchParams }: Props) {
  const { part: partRaw } = await params;
  const sp = await searchParams;
  const part = Number.parseInt(partRaw, 10);
  if (part !== 1 && part !== 2) {
    redirect(writingTestHubPath());
  }

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  if (!user) {
    redirect(
      resolveAuthRedirectPath(
        `/test/writing/task/${part}${sp.mock_attempt ? `?mock_attempt=${sp.mock_attempt}` : ""}`,
        cookieHeader,
      ),
    );
  }

  return (
    <WritingPage
      mockTestId={M01_MOCK_TEST_ID}
      part={part}
      autoStart={sp.auto === "1" || sp.auto === "true"}
    />
  );
}
