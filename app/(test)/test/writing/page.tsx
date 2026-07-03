import { redirect } from "next/navigation";
import { resolveAuthRedirectPath } from "@/lib/auth";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";
import { WritingTestHub } from "@/modules/writing/components/writing-test-hub";

export const metadata = {
  title: "Writing · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ mock_attempt?: string }>;
};

export default async function WritingTestPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  if (!user) {
    redirect(resolveAuthRedirectPath("/test/writing", cookieHeader));
  }

  return (
    <WritingTestHub mockAttemptId={sp.mock_attempt ?? null} />
  );
}
