"use client";

import { useCallback, useEffect, useState } from "react";
import { PlanDayCalendar } from "@/components/bandforge/plan/plan-day-calendar";
import {
  FullPlanCalendarSkeleton,
} from "@/components/bandforge/plan/plan-skeletons";
import { StudyPlanLoadError } from "@/components/bandforge/study-plan/study-plan-load-error";
import { getLearningProfile } from "@/lib/learning-api";
import type { LearningProfile } from "@/lib/learning-types";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; profile: LearningProfile }
  | { status: "error" };

export function StudyPlanFullClient() {
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
    return <FullPlanCalendarSkeleton label="Preparing your full plan" />;
  }

  if (state.status === "error") {
    return <StudyPlanLoadError onRetry={() => setFetchKey((k) => k + 1)} />;
  }

  const studyPlan = state.profile.study_plan;
  const examDate =
    state.profile.exam_date ?? studyPlan.exam_date ?? null;

  if ((studyPlan.weeks?.length ?? 0) === 0) {
    return (
      <div className="rounded-[28px] border border-white/60 bg-white/55 px-5 py-12 text-center shadow-[0_8px_40px_rgba(8,145,178,0.08)] backdrop-blur-xl">
        <p className="text-sm text-muted">
          No study plan days yet. Complete onboarding or open Today&apos;s plan
          to get started.
        </p>
      </div>
    );
  }

  return (
    <PlanDayCalendar studyPlan={studyPlan} examDate={examDate} variant="page" />
  );
}
