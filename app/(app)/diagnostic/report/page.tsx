import { redirect } from "next/navigation";
import { DiagnosticReportExperience } from "@/components/diagnostic/diagnostic-report-experience";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchDiagnosticLatest } from "@/lib/diagnostic-latest-server";
import { resolveDiagnosticRoute } from "@/lib/entitled-route";
import {
  emptyLearningProfile,
  fetchLearningProfile,
} from "@/lib/learning-server";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diagnostic Report · BandForge",
};

export default async function DiagnosticReportPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, "/diagnostic/report", cookieHeader);

  const learning =
    (await fetchLearningProfile(cookieHeader)) ??
    emptyLearningProfile(user!.id);

  const gate = resolveDiagnosticRoute(learning);
  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const diagnostic = await fetchDiagnosticLatest(cookieHeader);
  if (!diagnostic) {
    redirect("/diagnostic");
  }

  const targetBand = learning.target_band ?? 7;

  return (
    <DiagnosticReportExperience
      diagnostic={diagnostic}
      targetBand={targetBand}
    />
  );
}
