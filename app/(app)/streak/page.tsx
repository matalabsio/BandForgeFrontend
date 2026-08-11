import { StreakTrackerExperience } from "@/components/bandforge/streak/streak-tracker-experience";
import { fetchDashboardStreak } from "@/lib/dashboard-server";
import { getCachedCookieHeader } from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = { title: "Streak · BandForge" };

export default async function StreakPage() {
  const cookieHeader = await getCachedCookieHeader();
  const streak = await fetchDashboardStreak(cookieHeader);
  return <StreakTrackerExperience initial={streak} />;
}
