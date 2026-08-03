import { notFound, redirect } from "next/navigation";
import {
  PracticeHubExperience,
  type PlanTaskKind,
} from "@/components/bandforge/practice/practice-hub-experience";
import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitlementGate } from "@/lib/entitled-route-server";
import { isUuid } from "@/lib/mock-ids";
import {
  fetchMockUnlock,
  fetchPracticeHub,
  isHubLockedError,
} from "@/lib/practice-server";
import { isPracticeSkill, practiceSkillLabel } from "@/lib/practice-types";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ skill: string; hubId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function parsePlanTask(value: string | null): PlanTaskKind | null {
  if (value === "watch" || value === "practice" || value === "submit") return value;
  return null;
}

export async function generateMetadata({ params }: PageProps) {
  const { skill } = await params;
  if (!isPracticeSkill(skill)) {
    return { title: "Practice · BandForge" };
  }
  return {
    title: `${practiceSkillLabel(skill)} Hub · BandForge`,
  };
}

export default async function PracticeHubDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { skill, hubId } = await params;
  const sp = await searchParams;
  if (!isPracticeSkill(skill) || !isUuid(hubId)) notFound();

  const fromPlan = firstParam(sp.from) === "plan";
  const planTask = parsePlanTask(firstParam(sp.task));
  const planTaskId = firstParam(sp.taskId);

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, `/practice/${skill}/${hubId}`, cookieHeader);

  const { profile, subscription } = await fetchEntitlementGate(
    cookieHeader,
    user!.id,
  );

  let hub = null;
  let mockUnlock = null;
  try {
    // Plan-mode UI does not show mock unlock progress — skip that fetch.
    if (fromPlan) {
      hub = await fetchPracticeHub(cookieHeader, hubId);
    } else {
      [hub, mockUnlock] = await Promise.all([
        fetchPracticeHub(cookieHeader, hubId),
        fetchMockUnlock(cookieHeader, skill),
      ]);
    }
  } catch (e) {
    if (isHubLockedError(e)) {
      redirect(fromPlan ? "/study-plan/today" : `/practice/${skill}?hub=locked`);
    }
    throw e;
  }

  if (!hub || hub.skill !== skill) notFound();

  return (
    <EntitledRouteGate learning={profile} subscription={subscription}>
      <PracticeHubExperience
        skill={skill}
        hub={hub}
        mockUnlock={mockUnlock}
        fromPlan={fromPlan}
        planTask={planTask}
        planTaskId={planTaskId}
      />
    </EntitledRouteGate>
  );
}
