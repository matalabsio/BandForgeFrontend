"use client";

import { useEffect, useState } from "react";
import { OPEN_DAILY_REPORT_EVENT } from "@/components/bandforge/dashboard/dashboard-top-header";
import { DailyGrowthReportModal } from "@/components/bandforge/plan/daily-growth-report-modal";
import type { LearningStudyTask, SkillHubProgress } from "@/lib/learning-types";
import { mergePlanDayStatusesIntoTasks } from "@/lib/plan-day-tasks";
import { localPlanDateKey } from "@/lib/plan-step-completion";

type Props = {
  studentName: string;
  tasks: LearningStudyTask[];
  hubProgress?: Record<string, SkillHubProgress>;
  currentBand?: number | null;
  targetBand?: number | null;
  overallPlanPct?: number;
};

export function DashboardDailyReportHost({
  studentName,
  tasks,
  hubProgress,
  currentBand,
  targetBand,
  overallPlanPct,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reportTasks, setReportTasks] = useState(tasks);

  useEffect(() => {
    const onOpen = () => {
      setReportTasks(mergePlanDayStatusesIntoTasks(tasks));
      setOpen(true);
    };
    window.addEventListener(OPEN_DAILY_REPORT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_DAILY_REPORT_EVENT, onOpen);
  }, [tasks]);

  return (
    <DailyGrowthReportModal
      open={open}
      onClose={() => setOpen(false)}
      studentName={studentName}
      reportDate={new Date(`${localPlanDateKey()}T12:00:00`)}
      tasks={reportTasks}
      hubProgress={hubProgress}
      currentBand={currentBand}
      targetBand={targetBand}
      overallPlanPct={overallPlanPct}
    />
  );
}
