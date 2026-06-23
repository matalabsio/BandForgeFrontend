import { examApiCall } from "@/lib/exam-api-call";

export type ModuleProgressStatus = "locked" | "available" | "in_progress" | "completed";

export type ModuleProgress = {
  module: string;
  sequence_order: number;
  status: ModuleProgressStatus;
  duration_minutes: number;
  is_enabled: boolean;
  band: number | null;
  test_attempt_id: string | null;
  part: number | null;
};

export type SectionScore = {
  test_attempt_id: string;
  module: string;
  part: number | null;
  raw_score: number | null;
  total_questions: number | null;
  band: number | null;
};

export type MockAttemptProgress = {
  mock_attempt_id: string;
  mock_test_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  current_module: string | null;
  modules: ModuleProgress[];
  next_module: string | null;
  next_part: number | null;
  aggregate_band: number | null;
};

export type MockAttemptSummary = MockAttemptProgress & {
  sections: SectionScore[];
  reading_band: number | null;
  listening_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
};

export type MockCheckpointResponse = {
  attempt_id: string;
  band: number;
  raw_score: number;
  total_questions: number;
  skill_breakdown: Record<
    string,
    { correct: number; total: number; pct: number }
  >;
  status: string;
  next_module: string | null;
  next_part: number | null;
  reading_band: number | null;
  listening_band: number | null;
  modules: ModuleProgress[];
};

export type StartMockResponse = {
  mock_attempt_id: string;
  mock_test: { id: string; title: string; description?: string | null };
  current_module: string;
  module_attempt_id: string;
  part: number | null;
  resumed: boolean;
  progress?: MockAttemptProgress | null;
};

export type InProgressMockAttempt = {
  mock_attempt_id: string;
  mock_test_id: string;
  status: string;
  current_module: string | null;
};

export type MockAttemptHistoryItem = {
  mock_attempt_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  aggregate_band: number | null;
  reading_band: number | null;
  listening_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
};

export type MockAttemptHistoryLiteItem = {
  mock_attempt_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
};

function call<T>(path: string, init?: RequestInit): Promise<T> {
  return examApiCall<T>(path, init);
}

export const mockApi = {
  start(mockTestId: string, forceNew = false) {
    return call<StartMockResponse>("/api/mock-attempts", {
      method: "POST",
      body: JSON.stringify({ mock_test_id: mockTestId, force_new: forceNew }),
    });
  },

  progress(mockAttemptId: string) {
    return call<MockAttemptProgress>(
      `/api/mock-attempts/${encodeURIComponent(mockAttemptId)}`,
    );
  },

  summary(mockAttemptId: string) {
    return call<MockAttemptSummary>(
      `/api/mock-attempts/${encodeURIComponent(mockAttemptId)}/summary`,
    );
  },

  checkpoint(mockAttemptId: string, attemptId: string) {
    const q = new URLSearchParams({ attempt_id: attemptId });
    return call<MockCheckpointResponse>(
      `/api/mock-attempts/${encodeURIComponent(mockAttemptId)}/checkpoint?${q}`,
    );
  },

  inProgress(mockTestId: string) {
    return call<InProgressMockAttempt | null>(
      `/api/mock-attempts/in-progress?mock_test_id=${encodeURIComponent(mockTestId)}`,
    );
  },

  /** Active or latest attempt progress — one round trip for dashboard/hub init. */
  session(mockTestId: string) {
    return call<MockAttemptProgress | null>(
      `/api/mock-attempts/session?mock_test_id=${encodeURIComponent(mockTestId)}`,
    );
  },

  history(mockTestId: string) {
    return call<MockAttemptHistoryItem[]>(
      `/api/mock-attempts/history?mock_test_id=${encodeURIComponent(mockTestId)}`,
    );
  },

  historyLite(mockTestId: string) {
    return call<MockAttemptHistoryLiteItem[]>(
      `/api/mock-attempts/history-lite?mock_test_id=${encodeURIComponent(mockTestId)}`,
    );
  },

  resume(mockAttemptId: string) {
    return call<StartMockResponse>(
      `/api/mock-attempts/${encodeURIComponent(mockAttemptId)}/resume`,
      { method: "POST" },
    );
  },
};
