import type { DiagnosticLead } from "@/lib/diagnostic-lead";
import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";
import { syncDiagnosticToServer } from "@/lib/diagnostic-sync";
import { updateProfile } from "@/lib/profile";
import { getMe } from "@/lib/auth";

/** Profile lead sync memo — one PATCH per attempt per session. */
const leadProfileSynced = new Set<string>();
const leadProfileInFlight = new Set<string>();

/** After full-account login: persist diagnostic + lead fields server-side (non-blocking). */
export async function syncDiagnosticLeadAfterAuth(
  snapshot: DiagnosticResultsSnapshot,
  lead: DiagnosticLead,
  startedAt?: string,
): Promise<void> {
  const user = await getMe().catch(() => null);
  if (!user || user.role === "guest") return;

  const attemptId = snapshot.mock_attempt_id?.trim() || "";

  // Never overwrite an existing Writing track with purpose/lead defaults.
  const shouldWriteExamModule =
    Boolean(lead.examModule) &&
    user.exam_module !== "academic" &&
    user.exam_module !== "general_training";

  // Never block checkout / navigation on these writes
  void syncDiagnosticToServer(snapshot, startedAt);

  if (!attemptId || leadProfileSynced.has(attemptId) || leadProfileInFlight.has(attemptId)) {
    return;
  }

  leadProfileInFlight.add(attemptId);
  void updateProfile({
    full_name: lead.fullName,
    phone: lead.phone,
    target_band: lead.targetBand,
    exam_date: lead.examDate,
    ...(lead.purpose ? { ielts_purpose: lead.purpose } : {}),
    ...(lead.goal ? { ielts_goal: lead.goal } : {}),
    ...(shouldWriteExamModule && lead.examModule
      ? { exam_module: lead.examModule }
      : {}),
  })
    .then(() => {
      leadProfileSynced.add(attemptId);
    })
    .catch(() => undefined)
    .finally(() => {
      leadProfileInFlight.delete(attemptId);
    });
}

export function isFullAccountUser(role: string | undefined): boolean {
  return Boolean(role && role !== "guest");
}

/** Test-only: clear lead profile sync memo. */
export function resetDiagnosticLeadSyncDedupeForTests(): void {
  leadProfileSynced.clear();
  leadProfileInFlight.clear();
}
