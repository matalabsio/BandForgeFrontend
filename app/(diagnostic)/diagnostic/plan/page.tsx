import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { fetchSubscription } from "@/lib/payments-server";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";

export const metadata: Metadata = {
  title: "Your Study Plan · BandForge",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Plan unlock + checkout live on `/diagnostic/results` — keep this route for old links. */
export default async function DiagnosticPlanRevealPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);

  if (user) {
    const subscription = await fetchSubscription(cookieHeader);
    if (hasFullSkillProgram(subscription)) {
      redirect("/dashboard");
    }
  }

  redirect(`${diagnosticPaths.results}#plan-unlock`);
}
