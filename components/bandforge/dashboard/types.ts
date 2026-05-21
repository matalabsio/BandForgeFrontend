export type DashboardModule = "listening" | "reading" | "writing" | "speaking";

export type DashboardStats = {
  total_attempts: number;
  completed_attempts: number;
  in_progress_attempts: number;
  average_band: number | null;
  best_band: number | null;
  last_activity_at: string | null;
};

export type DashboardMockRef = {
  id: string;
  title: string;
};

export type DashboardInProgressAttempt = {
  id: string;
  module: DashboardModule | string;
  started_at: string;
  mock_test: DashboardMockRef;
};

export type DashboardRecentAttempt = {
  id: string;
  module: DashboardModule | string;
  started_at: string;
  completed_at: string | null;
  status: string;
  band: number | null;
  raw_score: number | null;
  total_questions: number | null;
  mock_test: DashboardMockRef;
};

export type DashboardSummary = {
  stats: DashboardStats;
  in_progress: DashboardInProgressAttempt[];
  recent: DashboardRecentAttempt[];
};

export type MockTestSummary = {
  id: string;
  title: string;
  description: string | null;
  listening_question_count?: number | null;
  listening_duration_minutes?: number;
};

export const MODULE_LABELS: Record<DashboardModule, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export const MODULE_AVAILABILITY: Record<DashboardModule, "live" | "soon"> = {
  listening: "live",
  reading: "live",
  writing: "soon",
  speaking: "soon",
};
