import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { TodaysPlanPanel } from "@/components/bandforge/dashboard/todays-plan-panel";
import { fetchEntitledContext } from "@/lib/entitled-route-server";
import type { LearningStudyPlan } from "@/lib/learning-types";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Today's Plan · BandForge",
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

/**
 * Auth + entitlement run in study-plan/layout. Profile is React-cached so
 * this call reuses the layout's fetchEntitledContext result.
 */
export default async function StudyPlanTodayPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  const { profile } = await fetchEntitledContext(
    cookieHeader,
    user?.id ?? "",
  );

  return (
    <div className="space-y-6">
      <header>
        <BfSectionEyebrow>Your schedule</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Today&apos;s plan</BfSectionHeading>
        <p className="mt-2 text-sm text-muted">
          Same tasks as your dashboard — skills in suggested order for today.
        </p>
      </header>
      <TodaysPlanPanel
        initialTasks={profile.todays_tasks}
        userId={user?.id ?? ""}
        hubProgress={profile.hub_progress}
        moduleSummary={profile.module_summary}
        currentBand={profile.current_band}
        targetBand={profile.target_band}
        overallPlanPct={overallPlanPercent(profile.study_plan)}
      />
    </div>
  );
}
