import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DiagnosticStartExperience } from "@/components/diagnostic/diagnostic-start-experience";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { fetchSubscription } from "@/lib/payments-server";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";

export const metadata: Metadata = {
  title: "Free Diagnostic · BandForge",
  description:
    "Take the free BandForge diagnostic — Listening, Reading, Writing, and Speaking with band scores in under 50 minutes. No account required.",
};

export const dynamic = "force-dynamic";

export default async function DiagnosticLandingPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);

  if (user) {
    const subscription = await fetchSubscription(cookieHeader);
    if (hasFullSkillProgram(subscription)) {
      redirect("/dashboard");
    }
  }

  return <DiagnosticStartExperience />;
}
