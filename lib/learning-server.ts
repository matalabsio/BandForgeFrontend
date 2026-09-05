import { cache } from "react";
import { getApiUrl } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { serverAuthHeaders } from "@/lib/server-auth-headers";
import { isAuthEnabled } from "@/lib/flags";
import type { LearningProfile } from "@/lib/learning-types";

const FETCH_MS = 45_000;

export function emptyLearningProfile(userId = ""): LearningProfile {
  return {
    user_id: userId,
    current_band: null,
    target_band: null,
    gap_to_target: null,
    module_summary: {},
    criterion_trends: {},
    skill_weaknesses: [],
    top_weaknesses: [],
    vocab_stats: {
      highlight_count: 0,
      weak_count: 0,
      strong_count: 0,
      recurring_weak: [],
      growth_delta: 0,
    },
    grammar_stats: {
      mistake_count: 0,
      by_issue: {},
      top_issues: [],
    },
    recommendations: [],
    study_plan: { weekly_focus: "", weeks: [] },
    weekly_goals: [],
    source_counts: {
      listening: 0,
      reading: 0,
      writing: 0,
      speaking: 0,
      diagnostic: 0,
    },
    refreshed_at: null,
    plan_week_start: null,
    todays_tasks: [],
    prep_start: null,
    exam_date: null,
    total_days: null,
    current_day: null,
    days_remaining: null,
    skill_difficulty: {},
    hub_progress: {},
  };
}

/** Deduped per RSC request — layout + page share one profile round-trip. */
export const fetchLearningProfile = cache(
  async (cookieHeader: string): Promise<LearningProfile | null> => {
    if (!isAuthEnabled() || !cookieHeader.trim()) return null;
    try {
      const res = await fetchWithTimeout(`${getApiUrl()}/api/learning/profile`, {
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: FETCH_MS,
      });
      if (!res.ok) return null;
      return (await res.json()) as LearningProfile;
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[learning] profile fetch failed:", err);
      }
      return null;
    }
  },
);

export async function refreshLearningProfileServer(
  cookieHeader: string,
): Promise<LearningProfile | null> {
  if (!isAuthEnabled() || !cookieHeader.trim()) return null;
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/learning/refresh`, {
      method: "POST",
      headers: serverAuthHeaders(cookieHeader),
      cache: "no-store",
      timeoutMs: FETCH_MS,
    });
    if (!res.ok) return null;
    return (await res.json()) as LearningProfile;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[learning] profile refresh failed:", err);
    }
    return null;
  }
}
