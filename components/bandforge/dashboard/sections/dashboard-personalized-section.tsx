import { DashboardTopHeader } from "@/components/bandforge/dashboard/dashboard-top-header";
import { DashboardBandGapSection } from "@/components/bandforge/dashboard/sections/dashboard-band-gap-section";
import { DashboardHubProgressSection } from "@/components/bandforge/dashboard/sections/dashboard-hub-progress-section";
import { DashboardTimelineSection } from "@/components/bandforge/dashboard/sections/dashboard-timeline-section";
import { DashboardWelcomeSection } from "@/components/bandforge/dashboard/sections/dashboard-welcome-section";
import { TodaysPlanPanel } from "@/components/bandforge/dashboard/todays-plan-panel";
import { fetchDashboardSummary } from "@/lib/dashboard-server";
import type { LearningProfile, LearningStudyPlan } from "@/lib/learning-types";

type UserProps = {
  firstName: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
};

type Props = {
  cookieHeader: string;
  learning: LearningProfile;
  user: UserProps;
  userId: string;
};

function overallPlanPercent(plan: LearningStudyPlan): number {
  const skillModules = ["listening", "reading", "writing", "speaking"];
  const today = new Date().toISOString().slice(0, 10);
  let done = 0;
  let total = 0;
  for (const week of plan.weeks) {
    for (const day of week.days) {
      if (day.date > today) continue;
      for (const task of day.tasks) {
        if (!skillModules.includes(task.module)) continue;
        total += 1;
        if (task.status === "done") done += 1;
      }
    }
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export async function DashboardPersonalizedSection({
  cookieHeader,
  learning,
  user,
  userId,
}: Props) {
  const summary = await fetchDashboardSummary(cookieHeader);
  const streak = summary.stats.current_streak ?? 0;

  return (
    <div className="space-y-6">
      <DashboardTopHeader
        firstName={user.firstName}
        displayName={user.displayName}
        email={user.email}
        avatarUrl={user.avatarUrl}
        streakDays={streak}
      />
      <DashboardWelcomeSection
        firstName={user.firstName}
        targetBand={learning.target_band}
        currentDay={learning.current_day ?? null}
        totalDays={learning.total_days ?? learning.study_plan.total_days ?? null}
        weeklyFocus={learning.study_plan.weekly_focus}
        skillDifficulty={
          learning.skill_difficulty ?? learning.study_plan.skill_difficulty ?? null
        }
      />
      <DashboardTimelineSection
        currentDay={learning.current_day ?? null}
        totalDays={learning.total_days ?? learning.study_plan.total_days ?? null}
        daysRemaining={learning.days_remaining ?? null}
        examDate={learning.exam_date ?? learning.study_plan.exam_date ?? null}
        studyPlan={learning.study_plan}
      />
      <DashboardBandGapSection learning={learning} />
      <TodaysPlanPanel
        initialTasks={learning.todays_tasks}
        userId={userId}
        hubProgress={learning.hub_progress}
        moduleSummary={learning.module_summary}
        currentBand={learning.current_band}
        targetBand={learning.target_band}
        overallPlanPct={overallPlanPercent(learning.study_plan)}
      />
      <DashboardHubProgressSection learning={learning} />
    </div>
  );
}
