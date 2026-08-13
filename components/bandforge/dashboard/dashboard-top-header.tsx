"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { BentoHoverCard } from "@/components/bandforge/dashboard/magic-bento-particle-card";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import { timeGreeting } from "@/components/bandforge/dashboard/utils";
import {
  ieltsDreamNameFromProfile,
  readDiagnosticLeadLoose,
} from "@/lib/diagnostic-lead";
import type { LearningStudyTask } from "@/lib/learning-types";
import {
  mergePlanDayStatusesIntoTasks,
  PLAN_DAY_TASKS_UPDATED_EVENT,
} from "@/lib/plan-day-tasks";
import { isTodayPlanComplete } from "@/lib/plan-start-task";
import { cn } from "@/lib/utils";

/** Fired by the header so TodaysPlanPanel / welcome can open the growth report. */
export const OPEN_DAILY_REPORT_EVENT = "bf:open-daily-report";

export function requestOpenDailyReport(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_DAILY_REPORT_EVENT));
}

export type HeaderPlanTimeline = {
  currentDay?: number | null;
  totalDays?: number | null;
  daysRemaining?: number | null;
  examDate?: string | null;
};

type Props = {
  firstName: string;
  displayName?: string;
  email?: string | null;
  avatarUrl?: string | null;
  /**
   * Static override when `todayTasks` is not provided.
   * Defaults to hidden — Report unlocks from completed today tasks.
   */
  showReportButton?: boolean;
  /** Today’s plan tasks — Report shows only when all actionable tasks are done. */
  todayTasks?: LearningStudyTask[] | null;
  planTimeline?: HeaderPlanTimeline | null;
  /** Persisted diagnostic purpose/goal — preferred over localStorage for the dream line. */
  ieltsPurpose?: string | null;
  ieltsGoal?: string | null;
};

const CARD =
  "h-full rounded-[1.75rem] sm:rounded-[2rem]";

function resolveReportUnlocked(
  todayTasks: LearningStudyTask[] | null | undefined,
  fallback: boolean,
): boolean {
  if (fallback) return true;
  if (todayTasks != null) {
    return isTodayPlanComplete(mergePlanDayStatusesIntoTasks(todayTasks));
  }
  return false;
}

export function DashboardTopHeader({
  firstName,
  showReportButton = false,
  todayTasks = null,
  ieltsPurpose = null,
  ieltsGoal = null,
}: Props) {
  const reduce = useReducedMotion();
  const [reportUnlocked, setReportUnlocked] = useState(showReportButton);
  const [dream, setDream] = useState(() =>
    ieltsDreamNameFromProfile({
      purpose: ieltsPurpose,
      goal: ieltsGoal,
    }),
  );

  useEffect(() => {
    setDream(
      ieltsDreamNameFromProfile({
        purpose: ieltsPurpose,
        goal: ieltsGoal,
        lead: readDiagnosticLeadLoose(),
      }),
    );
  }, [ieltsPurpose, ieltsGoal]);

  useEffect(() => {
    const recompute = () => {
      setReportUnlocked(resolveReportUnlocked(todayTasks, showReportButton));
    };
    recompute();

    window.addEventListener(PLAN_DAY_TASKS_UPDATED_EVENT, recompute);
    const onVisible = () => {
      if (document.visibilityState === "visible") recompute();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", recompute);

    return () => {
      window.removeEventListener(PLAN_DAY_TASKS_UPDATED_EVENT, recompute);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", recompute);
    };
  }, [todayTasks, showReportButton]);

  return (
    <header className="relative z-40">
      <motion.div
        className={cn(
          "grid grid-cols-1 items-stretch gap-3 sm:gap-3.5",
          reportUnlocked &&
            "lg:grid-cols-[minmax(0,1fr)_minmax(8.25rem,9.5rem)]",
        )}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: DASH_EASE }}
      >
        <BentoHoverCard
          className={cn(
            CARD,
            "min-w-0 justify-center px-5 py-4 sm:px-6 sm:py-[1.15rem]",
          )}
        >
          <h1 className="font-display text-[1.2rem] font-bold leading-none tracking-tight text-ink sm:text-[1.35rem]">
            {timeGreeting()}, {firstName}
          </h1>
          <p className="mt-2 text-[13px] leading-[1.5] text-muted sm:text-[13.5px]">
            Your{" "}
            <span className="font-semibold text-teal">{dream}</span>
            {" "}
            is in progress! Follow the BandForge method and we&apos;ll meet you
            at the finish line.
          </p>
        </BentoHoverCard>

        {reportUnlocked ? (
          <div className="hidden h-full min-h-[3.25rem] lg:block lg:min-w-[8.25rem]">
            <BentoHoverCard className="h-full min-h-[3.25rem]">
              <button
                type="button"
                onClick={() => requestOpenDailyReport()}
                className="flex h-full min-h-[3.25rem] w-full cursor-pointer flex-col items-center justify-center gap-1.5 px-4 py-3.5 text-teal"
                aria-label="Open today’s growth report card"
              >
                <FileText className="size-4" strokeWidth={2.25} aria-hidden />
                <span className="text-[12.5px] font-semibold">Report card</span>
              </button>
            </BentoHoverCard>
          </div>
        ) : null}
      </motion.div>
    </header>
  );
}
