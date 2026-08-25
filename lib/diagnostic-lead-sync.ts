import type { DiagnosticLead } from "@/lib/diagnostic-lead";
import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";
import { syncDiagnosticToServer } from "@/lib/diagnostic-sync";
import { updateProfile } from "@/lib/profile";
import { getMe } from "@/lib/auth";

/** Profile lead sync memo — one PATCH per attempt per session. */
const leadProfileSynced = new Set<string>();
/** In-flight profile sync promises so concurrent callers can await the same write. */
const leadProfileInFlight = new Map<string, Promise<void>>();

/**
 * After full-account login: persist diagnostic + lead fields server-side.
 * Diagnostic attempt sync stays non-blocking; profile exam_date write is awaited
 * so plan generation after payment sees the date.
 */
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

  // Never block checkout / navigation on diagnostic attempt sync
  void syncDiagnosticToServer(snapshot, startedAt);

  if (!attemptId) {
    // Still persist exam_date / profile fields when attempt id is missing.
    try {
      await updateProfile({
        full_name: lead.fullName,
        phone: lead.phone,
        target_band: lead.targetBand,
        exam_date: lead.examDate,
        ...(lead.purpose ? { ielts_purpose: lead.purpose } : {}),
        ...(lead.goal ? { ielts_goal: lead.goal } : {}),
        ...(shouldWriteExamModule && lead.examModule
          ? { exam_module: lead.examModule }
          : {}),
      });
    } catch {
      /* best-effort */
    }
    return;
  }

  if (leadProfileSynced.has(attemptId)) return;

  const existing = leadProfileInFlight.get(attemptId);
  if (existing) {
    await existing;
    return;
  }

  const write = (async () => {
    try {
      await updateProfile({
        full_name: lead.fullName,
        phone: lead.phone,
        target_band: lead.targetBand,
        exam_date: lead.examDate,
        ...(lead.purpose ? { ielts_purpose: lead.purpose } : {}),
        ...(lead.goal ? { ielts_goal: lead.goal } : {}),
        ...(shouldWriteExamModule && lead.examModule
          ? { exam_module: lead.examModule }
          : {}),
      });
      leadProfileSynced.add(attemptId);
    } catch {
      /* best-effort — backend plan gen has its own exam_date default */
    } finally {
      leadProfileInFlight.delete(attemptId);
    }
  })();

  leadProfileInFlight.set(attemptId, write);
  await write;
}

export function isFullAccountUser(role: string | undefined): boolean {
  return Boolean(role && role !== "guest");
}

/** Test-only: clear lead profile sync memo. */
export function resetDiagnosticLeadSyncDedupeForTests(): void {
  leadProfileSynced.clear();
  leadProfileInFlight.clear();
}
