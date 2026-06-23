import { ApiError, parseApiError, parseJsonResponse, type ApiErrorBody } from "@/lib/api";

async function adminCall<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await parseJsonResponse<T | ApiErrorBody>(res);
  if (!res.ok) {
    throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
  }
  return body as T;
}

async function adminMultipartCall<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
    cache: "no-store",
  });
  const body = await parseJsonResponse<T | ApiErrorBody>(res);
  if (!res.ok) {
    throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
  }
  return body as T;
}

export function defaultListeningAudioKey(mockId: string, part: number): string {
  return `listening/${mockId}/part-${part}/full.mp3`;
}

export type DashboardMetrics = {
  total_users: number;
  active_users_7d: number;
  new_signups_7d: number;
  mock_attempts_7d: number;
  speaking_pending: number;
  total_mocks?: number;
  published_mocks?: number;
  users_trend_pct?: number | null;
  signups_trend_pct?: number | null;
  mocks_trend_pct?: number | null;
};

export type DailyActivityPoint = {
  label: string;
  date: string;
  active_users: number;
  signups: number;
  mock_attempts: number;
};

export type RecentActivityItem = {
  id: string;
  message: string;
  created_at: string;
  kind: string;
};

export type DashboardOverview = {
  metrics: DashboardMetrics;
  weekly_activity: DailyActivityPoint[];
  recent_activity: RecentActivityItem[];
};

export type AdminUserListItem = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  mock_attempt_count: number;
  completed_mock_count: number;
  last_activity_at: string | null;
  best_band: number | null;
};

export type AdminUserDetail = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  mock_attempt_count: number;
  completed_mock_count: number;
};

export type AdminUserActivityStats = {
  total_attempts: number;
  completed_attempts: number;
  in_progress_attempts: number;
  average_band: number | null;
  best_band: number | null;
  last_activity_at: string | null;
  current_streak: number;
  longest_streak: number;
};

export type AdminUserInProgressItem = {
  id: string;
  module: string;
  started_at: string;
  mock_test_id: string;
  mock_title: string;
  catalog_number: number | null;
};

export type AdminUserModuleAttemptItem = {
  id: string;
  module: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  band: number | null;
  raw_score: number | null;
  total_count: number | null;
  mock_test_id: string;
  mock_title: string;
  catalog_number: number | null;
};

export type AdminUserMockSessionItem = {
  mock_attempt_id: string;
  mock_test_id: string;
  mock_title: string | null;
  catalog_number: number | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  listening_band: number | null;
  reading_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
  aggregate_band: number | null;
};

export type AdminUserDiagnosticItem = {
  id: string;
  client_attempt_id: string;
  status: string;
  listening_band: number | null;
  reading_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
  aggregate_band: number | null;
  review: Record<string, unknown> | null;
  pack_version: string | null;
  started_at: string | null;
  completed_at: string | null;
};

export type AdminUserSpeakingReviewItem = {
  id: string;
  attempt_id: string;
  status: string;
  human_band: number | null;
  created_at: string;
  mock_title: string | null;
};

export type AdminUserOverview = {
  profile: AdminUserDetail;
  stats: AdminUserActivityStats;
  in_progress: AdminUserInProgressItem[];
  recent_modules: AdminUserModuleAttemptItem[];
  mock_sessions: AdminUserMockSessionItem[];
  diagnostics: AdminUserDiagnosticItem[];
  speaking_reviews: AdminUserSpeakingReviewItem[];
};

export type SectionStatus = {
  part: number;
  question_count: number;
  has_audio: boolean;
};

export type ModuleSectionStatus = {
  module: string;
  sections: SectionStatus[];
};

export type AdminMockListItem = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  is_published: boolean;
  catalog_number: number | null;
  created_at: string;
  total_questions: number;
  configured_listening_parts?: number;
  configured_reading_passages?: number;
  configured_writing_tasks?: number;
  modules: {
    module: string;
    sequence_order: number;
    duration_minutes: number;
    is_enabled: boolean;
    question_count: number;
    parts: number[];
  }[];
};

export type AdminMockDetail = AdminMockListItem & {
  section_status?: ModuleSectionStatus[];
  publish_blockers?: string[];
};

export type SpeakingReviewListItem = {
  id: string;
  attempt_id: string;
  student_name: string | null;
  student_email: string | null;
  status: string;
  human_band: number | null;
  ai_overall_band?: number | null;
  created_at: string;
};

export type SpeakingSubmissionMeta = {
  part?: number | null;
  part_label?: string | null;
  cue_card?: string | null;
  prompt_title?: string | null;
};

export type SpeakingReviewDetail = {
  id: string;
  attempt_id: string;
  status: string;
  human_band: number | null;
  human_criteria_scores: {
    fluency: number;
    lexical: number;
    grammar: number;
    pronunciation: number;
  } | null;
  submission_meta: SpeakingSubmissionMeta | null;
  reviewer_notes: string | null;
  transcript: string | null;
  audio_url: string | null;
  audio_play_url: string | null;
  ai_scores: Record<string, unknown> | null;
  student_name: string | null;
  student_email: string | null;
  student_target_band: number | null;
  student_current_band: number | null;
  queue_pending_count: number;
  created_at: string;
  reviewed_at: string | null;
};

export type AuditLogItem = {
  id: string;
  admin_id: string;
  admin_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
};

export const adminApi = {
  metrics() {
    return adminCall<DashboardMetrics>("/dashboard/metrics");
  },

  dashboardOverview() {
    return adminCall<DashboardOverview>("/dashboard/overview");
  },

  listUsers(params?: { q?: string; page?: number; page_size?: number }) {
    const q = new URLSearchParams();
    if (params?.q) q.set("q", params.q);
    if (params?.page) q.set("page", String(params.page));
    if (params?.page_size) q.set("page_size", String(params.page_size));
    const suffix = q.toString() ? `?${q}` : "";
    return adminCall<{
      items: AdminUserListItem[];
      total: number;
      page: number;
      page_size: number;
    }>(`/users${suffix}`);
  },

  getUser(id: string) {
    return adminCall<AdminUserDetail>(`/users/${id}`);
  },

  getUserOverview(id: string) {
    return adminCall<AdminUserOverview>(`/users/${id}/overview`);
  },

  getUserAttempts(id: string) {
    return adminCall<AdminUserModuleAttemptItem[]>(`/users/${id}/attempts`);
  },

  patchUser(id: string, body: { is_active?: boolean; role?: string }) {
    return adminCall(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  listMocks() {
    return adminCall<AdminMockListItem[]>("/mocks");
  },

  createMock(body: {
    title: string;
    description?: string;
    catalog_number?: number;
    listening_parts?: number;
    reading_passages?: number;
    writing_tasks?: number;
  }) {
    return adminCall<AdminMockListItem>("/mocks", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getMock(id: string) {
    return adminCall<AdminMockDetail>(`/mocks/${id}`);
  },

  patchMock(
    id: string,
    body: {
      title?: string;
      description?: string;
      catalog_number?: number;
      listening_parts?: number;
      reading_passages?: number;
      writing_tasks?: number;
    },
  ) {
    return adminCall<AdminMockListItem>(`/mocks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  patchMockStatus(id: string, status: string) {
    return adminCall(`/mocks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  validateIngest(
    mockId: string,
    body: {
      module: string;
      part: number;
      data: Record<string, unknown>;
      audio_key?: string;
    },
  ) {
    return adminCall(`/mocks/${mockId}/ingest/validate`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  uploadListeningAudio(mockId: string, part: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return adminMultipartCall<{ ok: boolean; audio_key: string }>(
      `/mocks/${mockId}/ingest/audio?part=${part}`,
      formData,
    );
  },

  checkListeningAudio(mockId: string, part: number, key?: string) {
    const q = new URLSearchParams({ part: String(part) });
    if (key?.trim()) q.set("key", key.trim());
    return adminCall<{
      audio_key: string;
      exists_in_r2: boolean;
      playable?: boolean;
      size_bytes?: number;
      part: number;
    }>(`/mocks/${mockId}/ingest/audio?${q}`);
  },

  publishIngest(
    mockId: string,
    body: {
      module: string;
      part: number;
      data: Record<string, unknown>;
      audio_key?: string;
    },
  ) {
    return adminCall(`/mocks/${mockId}/ingest/publish`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  questionTree(mockId: string) {
    return adminCall<{ modules: unknown[] }>(`/mocks/${mockId}/questions`);
  },

  getQuestion(id: string) {
    return adminCall<Record<string, unknown>>(`/questions/${id}`);
  },

  patchQuestion(
    id: string,
    body: {
      prompt?: string;
      correct_answer?: string;
      explanation?: string;
      options?: unknown[];
    },
  ) {
    return adminCall(`/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  listSpeaking(params?: { status?: string; page?: number; page_size?: number }) {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.page) q.set("page", String(params.page));
    if (params?.page_size) q.set("page_size", String(params.page_size));
    const suffix = q.toString() ? `?${q}` : "";
    return adminCall<{
      items: SpeakingReviewListItem[];
      total: number;
      page: number;
      page_size: number;
      pending_count: number;
    }>(`/speaking${suffix}`);
  },

  getSpeaking(id: string) {
    return adminCall<SpeakingReviewDetail>(`/speaking/${id}`);
  },

  patchSpeaking(
    id: string,
    body: {
      human_criteria_scores?: {
        fluency: number;
        lexical: number;
        grammar: number;
        pronunciation: number;
      };
      reviewer_notes?: string;
      status?: "in_review";
    },
  ) {
    return adminCall<SpeakingReviewDetail>(`/speaking/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  approveSpeaking(
    id: string,
    body: {
      human_criteria_scores: {
        fluency: number;
        lexical: number;
        grammar: number;
        pronunciation: number;
      };
      reviewer_notes?: string;
    },
  ) {
    return adminCall<SpeakingReviewDetail>(`/speaking/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  listAuditLogs(page = 1) {
    return adminCall<{
      items: AuditLogItem[];
      total: number;
    }>(`/audit?page=${page}`);
  },
};
