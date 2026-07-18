export type PracticeSkill =
  | "listening"
  | "reading"
  | "writing"
  | "speaking";

export const PRACTICE_SKILLS: PracticeSkill[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

export type HubStatus = "pending" | "in_progress" | "completed";

export type PracticeHub = {
  id: string;
  slug: string;
  skill: PracticeSkill;
  bank_number: number;
  set_number: number;
  title: string;
  estimated_min: number;
  sort_order: number;
  status: HubStatus;
  completed_at: string | null;
};

export type PracticeHubDetail = PracticeHub & {
  videos: { title: string; url: string; duration_min: number }[];
  practice_prompt: string;
  submit_config: Record<string, unknown>;
};

export type SkillHubProgress = {
  skill: PracticeSkill;
  completed_count: number;
  total_count: number;
  required_for_mock: number;
  mock_unlocked: boolean;
  mock_test_id: string | null;
};

export type PracticeProgress = {
  skills: SkillHubProgress[];
};

export type MockUnlock = {
  skill: PracticeSkill;
  unlocked: boolean;
  completed: number;
  required: number;
  mock_test_id: string | null;
};

export type HubCompleteResult = {
  hub_id: string;
  status: HubStatus;
  completed_at: string | null;
  skill_progress: SkillHubProgress;
};

export function isPracticeSkill(value: string): value is PracticeSkill {
  return PRACTICE_SKILLS.includes(value as PracticeSkill);
}

export function practiceSkillLabel(skill: PracticeSkill): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}
