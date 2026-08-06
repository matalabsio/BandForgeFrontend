import { Suspense } from "react";
import { DashboardTopHeader } from "@/components/bandforge/dashboard/dashboard-top-header";
import {
  DashPageItem,
  DashPageMotion,
} from "@/components/bandforge/dashboard/motion";
import { DashboardBandGapSection } from "@/components/bandforge/dashboard/sections/dashboard-band-gap-section";
import { DashboardHubProgressSection } from "@/components/bandforge/dashboard/sections/dashboard-hub-progress-section";
import { countStudyDaysCompleted } from "@/components/bandforge/dashboard/sections/dashboard-timeline-section";
import { DashboardWelcomeSection } from "@/components/bandforge/dashboard/sections/dashboard-welcome-section";
import { TodaysPlanPanel } from "@/components/bandforge/dashboard/todays-plan-panel";
import {
  computeBandGapFromLearning,
  overallPlanPercent,
} from "@/lib/dashboard-plan-math";
import type { LearningProfile } from "@/lib/learning-types";

type UserProps = {
  firstName: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
};

type Props = {
  learning: LearningProfile;
  streakDays: number;
  user: UserProps;
  userId: string;
};

function PlanSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-24 animate-pulse rounded-[22px] bg-ink/[0.06]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-36 animate-pulse rounded-2xl bg-ink/[0.06]" />
        <div className="h-36 animate-pulse rounded-2xl bg-ink/[0.06]" />
        <div className="h-36 animate-pulse rounded-2xl bg-ink/[0.06]" />
        <div className="h-36 animate-pulse rounded-2xl bg-ink/[0.06]" />
      </div>
    </div>
  );
}

function SkillsSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-8 w-40 animate-pulse rounded-lg bg-ink/[0.06]" />
      <div className="h-28 animate-pulse rounded-2xl bg-ink/[0.06]" />
      <div className="h-28 animate-pulse rounded-2xl bg-ink/[0.06]" />
      <div className="mt-6 h-8 w-36 animate-pulse rounded-lg bg-ink/[0.06]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-2xl bg-ink/[0.06]" />
        <div className="h-24 animate-pulse rounded-2xl bg-ink/[0.06]" />
      </div>
    </div>
  );
}

export async function DashboardPersonalizedSection({
  learning,
  streakDays,
  user,
  userId,
}: Props) {
  const studyPlan = learning.study_plan;
  const studyDaysCompleted = countStudyDaysCompleted(studyPlan);
  const totalDays = learning.total_days ?? studyPlan.total_days ?? null;
  const currentDay = learning.current_day ?? null;
  const examDate = learning.exam_date ?? studyPlan.exam_date ?? null;
  const planPct = overallPlanPercent(studyPlan);
  const bandGap = computeBandGapFromLearning(learning);
  const actionableToday = learning.todays_tasks.filter(
    (t) => t.status !== "skipped",
  );
  const todayPlanComplete =
    actionableToday.length > 0 &&
    actionableToday.every((t) => t.status === "done");

  const todayPlanBlock = (
    <Suspense fallback={<PlanSkeleton />}>
      <TodaysPlanPanel
        initialTasks={learning.todays_tasks}
        userId={userId}
        studentName={user.displayName}
        hubProgress={learning.hub_progress}
        moduleSummary={learning.module_summary}
        currentBand={learning.current_band}
        targetBand={learning.target_band}
        overallPlanPct={planPct}
        embedded
        studyPlan={studyPlan}
        examDate={examDate}
      />
    </Suspense>
  );

  const welcomeBlock = (
    <DashboardWelcomeSection
      targetBand={learning.target_band}
      currentDay={currentDay}
      totalDays={totalDays}
      weeklyFocus={studyPlan.weekly_focus}
      skillDifficulty={
        learning.skill_difficulty ?? studyPlan.skill_difficulty ?? null
      }
      daysRemaining={learning.days_remaining ?? null}
      examDate={examDate}
      studyDaysCompleted={studyDaysCompleted}
      bandGapCurrent={bandGap.currentBand}
      bandGapDelta={bandGap.gap}
      bandGapScoredCount={bandGap.scoredCount}
      bandGapIsPartial={bandGap.isPartial}
      resolvedTargetBand={bandGap.targetBand}
      studyPlan={studyPlan}
      studentName={user.displayName}
      hubProgress={learning.hub_progress}
      currentBand={learning.current_band}
      overallPlanPct={planPct}
    />
  );

  return (
    <DashPageMotion>
      <DashPageItem>
        <DashboardTopHeader
          firstName={user.firstName}
          displayName={user.displayName}
          email={user.email}
          avatarUrl={user.avatarUrl}
          streakDays={streakDays}
        />
      </DashPageItem>

      {/* When today is done, pin check-in CTAs into the first viewport. */}
      {todayPlanComplete ? (
        <>
          <DashPageItem>{todayPlanBlock}</DashPageItem>
          <DashPageItem>{welcomeBlock}</DashPageItem>
        </>
      ) : (
        <>
          <DashPageItem>{welcomeBlock}</DashPageItem>
          <DashPageItem>{todayPlanBlock}</DashPageItem>
        </>
      )}

      <DashPageItem>
        <Suspense fallback={<SkillsSkeleton />}>
          <div className="space-y-5 sm:space-y-7">
            <DashboardBandGapSection
              bands={bandGap.bands}
              targetBand={bandGap.targetBand}
              isPartial={bandGap.isPartial}
              scoredCount={bandGap.scoredCount}
            />
            <DashboardHubProgressSection
              learning={learning}
              overallPlanPct={planPct}
            />
          </div>
        </Suspense>
      </DashPageItem>
    </DashPageMotion>
  );
}
