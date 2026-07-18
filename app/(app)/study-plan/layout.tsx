import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import { StudyPlanSubNav } from "@/components/bandforge/study-plan/study-plan-sub-nav";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitledContext } from "@/lib/entitled-route-server";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export default async function StudyPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, "/study-plan", cookieHeader);

  const { profile, subscription } = await fetchEntitledContext(
    cookieHeader,
    user!.id,
  );

  return (
    <EntitledRouteGate learning={profile} subscription={subscription}>
      <div className="space-y-2">
        <StudyPlanSubNav />
        {children}
      </div>
    </EntitledRouteGate>
  );
}
