import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DiagnosticStartExperience } from "@/components/diagnostic/diagnostic-start-experience";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { fetchSubscription } from "@/lib/payments-server";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";

export const metadata: Metadata = pageMetadata({
  title: "Free IELTS Diagnostic Test — 15 Minutes | BandForge",
  description:
    "Take BandForge's free 15-minute IELTS diagnostic. Section-wise band scores for Listening, Reading, Writing, and Speaking. No payment. No spam.",
  path: "/diagnostic",
});

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
