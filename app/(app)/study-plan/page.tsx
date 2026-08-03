import { StudyPlanExperience } from "@/components/bandforge/study-plan/study-plan-experience";
import { fetchEntitledContext } from "@/lib/entitled-route-server";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Study Plan · BandForge",
};

/** Auth gated in layout; profile cached with layout's fetchEntitledContext. */
export default async function StudyPlanPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  const { profile } = await fetchEntitledContext(
    cookieHeader,
    user?.id ?? "",
  );

  return <StudyPlanExperience profile={profile} />;
}
