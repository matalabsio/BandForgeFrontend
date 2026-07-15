/** Adaptive learning profile types (Phase 9). */

export type LearningStudyTask = {
  id: string;
  title: string;
  subtitle: string;
  module: string;
  kind: "practice" | "homework" | "goal";
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
};
