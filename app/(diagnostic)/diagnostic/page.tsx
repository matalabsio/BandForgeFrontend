import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DiagnosticStartExperience } from "@/components/diagnostic/diagnostic-start-experience";
import { isAuthEnabled } from "@/lib/flags";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";
import { GUEST_USER } from "@/lib/session";

export const metadata: Metadata = {
  title: "Free Diagnostic · BandForge",
  description:
    "Take the free BandForge diagnostic — Listening, Reading, Writing, and Speaking with band scores in under 50 minutes. No account required.",
};

export default async function DiagnosticLandingPage() {
  if (isAuthEnabled()) {
    const cookieHeader = await getCachedCookieHeader();
    const user = await getCachedServerSession(cookieHeader);
    if (
      user &&
      user.id !== GUEST_USER.id &&
      user.role === "student" &&
      user.is_active !== false
    ) {
      redirect("/dashboard?from=diagnostic");
    }
  }

  return <DiagnosticStartExperience />;
}
