import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authBootstrapPath } from "@/lib/auth";
import { mockTestsIndexPath } from "@/lib/mock-catalog";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { MockTestsCatalog } from "@/modules/mock/components/mock-tests-catalog";

export const metadata: Metadata = {
  title: "Full mock tests · BandForge",
  description:
    "Choose an IELTS Academic full mock test. Test 1 and Test 2 are live.",
  robots: { index: false, follow: false },
};

export default async function MockTestsIndexPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);

  if (!user) {
    redirect(authBootstrapPath(mockTestsIndexPath()));
  }

  return (
    <MockLayout>
      <MockTestsCatalog />
    </MockLayout>
  );
}
