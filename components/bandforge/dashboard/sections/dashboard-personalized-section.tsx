import { Suspense } from "react";
import { DashboardTopHeader } from "@/components/bandforge/dashboard/dashboard-top-header";
import {
  DashPageItem,
  DashPageMotion,
} from "@/components/bandforge/dashboard/motion";
import { DashboardBandGapSection } from "@/components/bandforge/dashboard/sections/dashboard-band-gap-section";
import { DashboardHubProgressSection } from "@/components/bandforge/dashboard/sections/dashboard-hub-progress-section";
import { DashboardWeeklyFocusSection } from "@/components/bandforge/dashboard/sections/dashboard-weekly-focus-section";
import { DashboardWelcomeSection } from "@/components/bandforge/dashboard/sections/dashboard-welcome-section";
import {
  computeBandGapFromLearning,
  overallPlanPercent,
  resolveExamTimeline,
} from "@/lib/dashboard-plan-math";
import type { LearningProfile } from "@/lib/learning-types";
import { buildDashboardStartNow } from "@/lib/plan-start-task";

type UserProps = {
  firstName: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
};

type Props = {
  learning: LearningProfile;
  user: UserProps;
  userId?: string;
};

function SkillsSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-7" aria-hidden>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[24px] bg-ink/[0.06]" />
        <div className="h-64 animate-pulse rounded-[24px] bg-ink/[0.06]" />
      </div>
      <div className="h-8 w-36 animate-pulse rounded-lg bg-ink/[0.06]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-2xl bg-ink/[0.06]" />
        <div className="h-24 animate-pulse rounded-2xl bg-ink/[0.06]" />
      </div>
    </div>
  );
}

export async function DashboardPersonalizedSection({
  learning,
  user,
}: Props) {
  const studyPlan = learning.study_plan;
  const examTimeline = resolveExamTimeline(learning);
  const planPct = overallPlanPercent(studyPlan);
  const bandGap = computeBandGapFromLearning(learning);
  const actionableToday = learning.todays_tasks.filter(
    (t) => t.status !== "skipped",
  );
  const todayPlanComplete =
    actionableToday.length > 0 &&
    actionableToday.every((t) => t.status === "done");
  const startNow = todayPlanComplete
    ? null
    : buildDashboardStartNow(learning.todays_tasks);

  const welcomeBlock = (
    <DashboardWelcomeSection
      targetBand={learning.target_band}
      bandGapCurrent={bandGap.currentBand}
      bandGapDelta={bandGap.gap}
      bandGapScoredCount={bandGap.scoredCount}
      bandGapIsPartial={bandGap.isPartial}
      resolvedTargetBand={bandGap.targetBand}
      studentName={user.displayName}
      hubProgress={learning.hub_progress}
      currentBand={learning.current_band}
      overallPlanPct={planPct}
      startNow={startNow}
      startNowCacheTasks={learning.todays_tasks}
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
          planTimeline={examTimeline}
        />
      </DashPageItem>

      <DashPageItem>{welcomeBlock}</DashPageItem>

      <DashPageItem>
        <Suspense fallback={<SkillsSkeleton />}>
          <div className="space-y-5 sm:space-y-7">
            <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
              <DashboardBandGapSection
                bands={bandGap.bands}
                targetBand={bandGap.targetBand}
                isPartial={bandGap.isPartial}
                scoredCount={bandGap.scoredCount}
              />
              <DashboardWeeklyFocusSection
                weeklyFocus={studyPlan.weekly_focus}
                skillDifficulty={
                  learning.skill_difficulty ?? studyPlan.skill_difficulty ?? null
                }
                studyPlan={studyPlan}
                examDate={examTimeline.examDate}
                currentDay={examTimeline.currentDay}
                targetBand={learning.target_band}
                studentName={user.displayName}
                hubProgress={learning.hub_progress}
                currentBand={learning.current_band}
                overallPlanPct={planPct}
              />
            </div>
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
