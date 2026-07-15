import { StudyPlanExperience } from "@/components/bandforge/study-plan/study-plan-experience";
import {
  emptyLearningProfile,
  fetchLearningProfile,
} from "@/lib/learning-server";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Study Plan · BandForge",
};

export default async function StudyPlanPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, "/study-plan", cookieHeader);

  const profile =
    (await fetchLearningProfile(cookieHeader)) ??
    emptyLearningProfile(user?.id ?? "");

  return <StudyPlanExperience profile={profile} />;
}
