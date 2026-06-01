import { notFound, redirect } from "next/navigation";
import { authGuardRedirectPath } from "@/lib/auth";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { Test1QaPanel } from "@/app/dev/test1/test1-qa-panel";

export const metadata = {
  title: "Test 1 QA · Dev",
  robots: { index: false, follow: false },
};

export default async function DevTest1Page() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authGuardRedirectPath("/dev/test1"));
  }

  return <Test1QaPanel />;
}
