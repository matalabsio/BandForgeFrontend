import { examApiCall } from "@/lib/exam-api-call";
import {
  fetchStudyPlanWithRetry,
  STUDY_PLAN_FETCH_MS,
} from "@/lib/study-plan-client-fetch";
import type {
  LearningProfile,
  LearningTodayBundle,
} from "@/lib/learning-types";

export async function getLearningProfile(): Promise<LearningProfile> {
  return fetchStudyPlanWithRetry(() =>
    examApiCall<LearningProfile>("/api/learning/profile", undefined, {
      timeoutMs: STUDY_PLAN_FETCH_MS,
    }),
  );
}

export async function getLearningToday(): Promise<LearningTodayBundle> {
  return fetchStudyPlanWithRetry(() =>
    examApiCall<LearningTodayBundle>("/api/learning/today", undefined, {
      timeoutMs: STUDY_PLAN_FETCH_MS,
    }),
  );
}

export async function refreshLearningProfile(): Promise<LearningProfile> {
  return examApiCall<LearningProfile>(
    "/api/learning/refresh",
    { method: "POST" },
    { timeoutMs: STUDY_PLAN_FETCH_MS },
  );
}

export async function generateLearningPlan(
  planTier = "full_skill_program",
): Promise<LearningProfile> {
  return examApiCall<LearningProfile>(
    "/api/learning/plan/generate",
    {
      method: "POST",
      body: JSON.stringify({ plan_tier: planTier }),
    },
    { timeoutMs: STUDY_PLAN_FETCH_MS },
  );
}

export async function patchLearningTask(
  taskId: string,
  status: "pending" | "done" | "skipped",
): Promise<{ task_id: string; status: string; study_plan: LearningProfile["study_plan"] }> {
  return examApiCall(`/api/learning/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
