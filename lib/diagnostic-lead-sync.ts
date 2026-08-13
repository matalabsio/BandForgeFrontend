import type { DiagnosticLead } from "@/lib/diagnostic-lead";
import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";
import { syncDiagnosticToServer } from "@/lib/diagnostic-sync";
import { updateProfile } from "@/lib/profile";
import { getMe } from "@/lib/auth";

/** After full-account login: persist diagnostic + lead fields server-side (non-blocking). */
export async function syncDiagnosticLeadAfterAuth(
  snapshot: DiagnosticResultsSnapshot,
  lead: DiagnosticLead,
  startedAt?: string,
): Promise<void> {
  const user = await getMe().catch(() => null);
  if (!user || user.role === "guest") return;

  // Never block checkout / navigation on these writes
  void syncDiagnosticToServer(snapshot, startedAt);
  void updateProfile({
    full_name: lead.fullName,
    phone: lead.phone,
    target_band: lead.targetBand,
    exam_date: lead.examDate,
    ...(lead.purpose ? { ielts_purpose: lead.purpose } : {}),
    ...(lead.goal ? { ielts_goal: lead.goal } : {}),
  }).catch(() => undefined);
}

export function isFullAccountUser(role: string | undefined): boolean {
  return Boolean(role && role !== "guest");
}
