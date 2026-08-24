import { examApiCall } from "@/lib/exam-api-call";
import type { LearningProfile, LearningStudyPlan } from "@/lib/learning-types";

export async function getLearningProfile(): Promise<LearningProfile> {
  return examApiCall<LearningProfile>("/api/learning/profile");
}

export async function refreshLearningProfile(): Promise<LearningProfile> {
  return examApiCall<LearningProfile>("/api/learning/refresh", { method: "POST" });
}

export async function generateLearningPlan(
  planTier = "full_skill_program",
): Promise<LearningProfile> {
  return examApiCall<LearningProfile>("/api/learning/plan/generate", {
    method: "POST",
    body: JSON.stringify({ plan_tier: planTier }),
  });
}

export async function patchLearningTask(
  taskId: string,
  status: "pending" | "done" | "skipped",
): Promise<{ task_id: string; status: string; study_plan: LearningStudyPlan }> {
  return examApiCall(`/api/learning/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
