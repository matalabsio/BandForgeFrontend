"use client";

import { useCallback, useEffect, useState } from "react";
import { TodaysPlanPanel } from "@/components/bandforge/dashboard/todays-plan-panel";
import { TodaysPlanSkeleton } from "@/components/bandforge/plan/plan-skeletons";
import { StudyPlanLoadError } from "@/components/bandforge/study-plan/study-plan-load-error";
import { getLearningToday } from "@/lib/learning-api";
import type { LearningTodayBundle } from "@/lib/learning-types";

type Props = {
  userId: string;
  studentName: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; bundle: LearningTodayBundle }
  | { status: "error" };

export function StudyPlanTodayClient({ userId, studentName }: Props) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [fetchKey, setFetchKey] = useState(0);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const bundle = await getLearningToday();
      setState({ status: "ready", bundle });
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

  const { bundle } = state;

  return (
    <TodaysPlanPanel
      initialTasks={bundle.todays_tasks}
      userId={userId}
      studentName={studentName}
      hubProgress={bundle.hub_progress}
      moduleSummary={{}}
      currentBand={bundle.current_band}
      targetBand={bundle.target_band}
      overallPlanPct={0}
      examDate={bundle.exam_date}
    />
  );
}
