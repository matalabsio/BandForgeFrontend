import type { DiagnosticLead } from "@/lib/diagnostic-lead";
import type { DiagnosticProgress } from "@/lib/diagnostic-storage";
import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";

type SubmitBody = {
  client_attempt_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  goal_label: string | null;
  target_band: number | null;
  exam_date: string | null;
  listening_band: number | null;
  reading_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
  aggregate_band: number | null;
  answers: DiagnosticProgress["answers"];
  review: DiagnosticResultsSnapshot["review"];
};

/** Queue diagnostic for human examiner review (marketing funnel). */
export function submitDiagnosticForReview(
  lead: DiagnosticLead,
  progress: DiagnosticProgress,
  snapshot: DiagnosticResultsSnapshot,
): void {
  if (typeof window === "undefined") return;

  const body: SubmitBody = {
    client_attempt_id: progress.attemptId,
    full_name: lead.fullName,
    phone: lead.phone,
    email: lead.email ?? null,
    goal_label: lead.goalLabel,
    target_band: lead.targetBand,
    exam_date: lead.examDate,
    listening_band: snapshot.listening_band,
    reading_band: snapshot.reading_band,
    writing_band: snapshot.writing_band,
    speaking_band: snapshot.speaking_band,
    aggregate_band: snapshot.aggregate_band,
    answers: progress.answers,
    review: snapshot.review,
  };

  void fetch("/api/diagnostic/submit-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((res) => {
    if (!res.ok && process.env.NODE_ENV === "development") {
      console.warn("submit-review failed:", res.status, body.client_attempt_id);
    }
  }).catch(() => {
    /* non-blocking — local results remain */
  });
}
