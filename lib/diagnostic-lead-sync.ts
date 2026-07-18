import type { DiagnosticLead } from "@/lib/diagnostic-lead";
import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";
import { syncDiagnosticToServer } from "@/lib/diagnostic-sync";
import { updateProfile } from "@/lib/profile";
import { getMe } from "@/lib/auth";

/** After full-account login: persist diagnostic + lead fields server-side. */
export async function syncDiagnosticLeadAfterAuth(
  snapshot: DiagnosticResultsSnapshot,
  lead: DiagnosticLead,
  startedAt?: string,
): Promise<void> {
  const user = await getMe().catch(() => null);
  if (!user || user.role === "guest") return;

  void syncDiagnosticToServer(snapshot, startedAt);

  try {
    await updateProfile({
      full_name: lead.fullName,
      phone: lead.phone,
      target_band: lead.targetBand,
      exam_date: lead.examDate,
    });
  } catch {
    /* non-blocking — local preview still works */
  }
}

export function isFullAccountUser(role: string | undefined): boolean {
  return Boolean(role && role !== "guest");
}
