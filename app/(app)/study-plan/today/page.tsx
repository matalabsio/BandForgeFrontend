import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { TodaysPlanPanel } from "@/components/bandforge/dashboard/todays-plan-panel";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitledContext } from "@/lib/entitled-route-server";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Today's Plan · BandForge",
};

export default async function StudyPlanTodayPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, "/study-plan/today", cookieHeader);

  const { profile } = await fetchEntitledContext(cookieHeader, user!.id);

  return (
    <div className="space-y-6">
      <header>
        <BfSectionEyebrow>Your schedule</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Today&apos;s plan</BfSectionHeading>
        <p className="mt-2 text-sm text-muted">
          Same tasks as your dashboard — videos and practice for today.
        </p>
      </header>
      <TodaysPlanPanel
        initialTasks={profile.todays_tasks}
        userId={user!.id}
      />
    </div>
  );
}
