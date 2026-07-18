export type DiagnosticLatest = {
  id: string;
  client_attempt_id: string | null;
  status: string | null;
  listening_band: number | null;
  reading_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
  aggregate_band: number | null;
  completed_at: string | null;
  pack_version: string | null;
};
