import { redirect } from "next/navigation";
import { authBootstrapPath } from "@/lib/auth";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
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
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authBootstrapPath("/test/writing"));
  }

  return (
    <WritingTestHub mockAttemptId={sp.mock_attempt ?? null} />
  );
}
