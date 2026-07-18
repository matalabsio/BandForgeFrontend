import { StudyPlanExperience } from "@/components/bandforge/study-plan/study-plan-experience";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitledContext } from "@/lib/entitled-route-server";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Study Plan · BandForge",
};

export default async function StudyPlanPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, "/study-plan", cookieHeader);

  const { profile } = await fetchEntitledContext(cookieHeader, user!.id);

  return <StudyPlanExperience profile={profile} />;
}
