import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";

type DiagnosticCompleteBody = {
  client_attempt_id: string;
  listening_band: number | null;
  reading_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
  aggregate_band: number | null;
  review?: DiagnosticResultsSnapshot["review"];
  started_at?: string;
  completed_at?: string | null;
};

/** Fire-and-forget sync when a logged-in student completes the diagnostic funnel. */
export function syncDiagnosticToServer(
  snapshot: DiagnosticResultsSnapshot,
  startedAt?: string,
): void {
  if (typeof window === "undefined") return;

  const body: DiagnosticCompleteBody = {
    client_attempt_id: snapshot.mock_attempt_id,
    listening_band: snapshot.listening_band,
    reading_band: snapshot.reading_band,
    writing_band: snapshot.writing_band,
    speaking_band: snapshot.speaking_band,
    aggregate_band: snapshot.aggregate_band,
    review: snapshot.review,
    started_at: startedAt,
    completed_at: snapshot.completed_at ?? null,
  };

  void fetch("/api/diagnostic/complete", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {
    /* non-blocking — local results remain in localStorage */
  });
}
