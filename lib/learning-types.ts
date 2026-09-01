/** Adaptive learning profile types (Phase 9). */

export type LearningStudyTask = {
  id: string;
  title: string;
  subtitle: string;
  module: string;
  kind: "practice" | "homework" | "goal";
  task_type?: "watch" | "practice" | "submit";
  hub_id?: string | null;
  duration_min: number;
  href: string;
  status: "pending" | "done" | "skipped";
};

export type LearningStudyDay = {
  date: string;
  label: string;
  tasks: LearningStudyTask[];
};

export type LearningStudyWeek = {
  id: string;
  label: string;
  focus: string;
  days: LearningStudyDay[];
};

export type LearningStudyPlan = {
  weekly_focus: string;
  weeks: LearningStudyWeek[];
  prep_start?: string | null;
  exam_date?: string | null;
  total_days?: number | null;
  plan_tier?: string | null;
  skill_difficulty?: Record<string, string>;
  session_path_kind?: string | null;
  diagnostic_attempt_id?: string | null;
  assigned_hub_ids?: string[];
};

export type SkillHubProgress = {
  skill: string;
  completed_count: number;
  total_count: number;
  required_for_mock: number;
  mock_unlocked: boolean;
  mock_test_id?: string | null;
};

export type LearningRecommendation = {
  id: string;
  title: string;
  reason: string;
  href: string;
  module: string | null;
};

export type LearningWeeklyGoal = {
  id: string;
  title: string;
  module: string | null;
  done: boolean;
};

export type LearningWeakness = {
  area: string;
  module: string;
  label: string;
  severity: number;
  evidence_count: number;
};

export type WeeklyHubCompletion = {
  date: string;
  skill: string;
  hub_id: string;
};

export type LearningProfile = {
  user_id: string;
  current_band: number | null;
  target_band: number | null;
  gap_to_target: number | null;
  module_summary: Record<
    string,
    { latest: number | null; best: number | null; n: number; gap: number | null }
  >;
  criterion_trends: Record<string, unknown>;
  skill_weaknesses: Array<Record<string, unknown>>;
  top_weaknesses: LearningWeakness[];
  vocab_stats: {
    highlight_count: number;
    weak_count: number;
    strong_count: number;
    recurring_weak: string[];
    growth_delta: number;
  };
  grammar_stats: {
    mistake_count: number;
    by_issue: Record<string, number>;
    top_issues: string[];
  };
  recommendations: LearningRecommendation[];
  study_plan: LearningStudyPlan;
  weekly_goals: LearningWeeklyGoal[];
  source_counts: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    diagnostic: number;
  };
  refreshed_at: string | null;
  plan_week_start: string | null;
  todays_tasks: LearningStudyTask[];
  prep_start?: string | null;
  exam_date?: string | null;
  total_days?: number | null;
  current_day?: number | null;
  days_remaining?: number | null;
  skill_difficulty?: Record<string, string>;
  hub_progress?: Record<string, SkillHubProgress>;
  weekly_hub_completions?: WeeklyHubCompletion[];
};
