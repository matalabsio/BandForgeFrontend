"use client";

import { useCallback, useEffect, useState } from "react";
import { TodaysPlanPanel } from "@/components/bandforge/dashboard/todays-plan-panel";
import { TodaysPlanSkeleton } from "@/components/bandforge/plan/plan-skeletons";
import { StudyPlanLoadError } from "@/components/bandforge/study-plan/study-plan-load-error";
import { getLearningProfile } from "@/lib/learning-api";
import type { LearningProfile } from "@/lib/learning-types";

type Props = {
  userId: string;
  studentName: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; profile: LearningProfile }
  | { status: "error" };

export function StudyPlanTodayClient({ userId, studentName }: Props) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [fetchKey, setFetchKey] = useState(0);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const profile = await getLearningProfile();
      setState({ status: "ready", profile });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, fetchKey]);

  if (state.status === "loading") {
    return <TodaysPlanSkeleton label="Preparing today’s plan" />;
  }

  if (state.status === "error") {
    return <StudyPlanLoadError onRetry={() => setFetchKey((k) => k + 1)} />;
  }

  const { profile } = state;
  const studyPlan = profile.study_plan;
  const examDate = profile.exam_date ?? studyPlan?.exam_date ?? null;

  return (
    <TodaysPlanPanel
      initialTasks={profile.todays_tasks ?? []}
      userId={userId}
      studentName={studentName}
      hubProgress={profile.hub_progress}
      moduleSummary={profile.module_summary ?? {}}
      currentBand={profile.current_band}
      targetBand={profile.target_band}
      overallPlanPct={0}
      studyPlan={studyPlan}
      examDate={examDate}
    />
  );
}
