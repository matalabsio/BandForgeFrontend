import { notFound } from "next/navigation";
import { PracticeObjectiveResultsClient } from "@/components/bandforge/practice/practice-objective-results-client";
import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitlementGate } from "@/lib/entitled-route-server";
import { isUuid } from "@/lib/mock-ids";
import type { PlanTaskKind } from "@/lib/plan-task-flow";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ hubId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function PracticeReadingResultsPage({
  params,
  searchParams,
}: PageProps) {
  const { hubId } = await params;
  const sp = await searchParams;
  if (!isUuid(hubId)) notFound();

  const attemptId = firstParam(sp.attempt);
  if (!attemptId || !isUuid(attemptId)) notFound();

  const fromPlan = firstParam(sp.from) === "plan";
  const planTaskId = firstParam(sp.taskId);
  const planTaskRaw = firstParam(sp.task);
  const planTask: PlanTaskKind | null =
    planTaskRaw === "watch" ||
    planTaskRaw === "practice" ||
    planTaskRaw === "submit"
      ? planTaskRaw
      : null;

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(
    user,
    `/practice/reading/${hubId}/exercise/results?attempt=${attemptId}`,
    cookieHeader,
  );

  const { profile, subscription } = await fetchEntitlementGate(
    cookieHeader,
    user!.id,
  );

  return (
    <EntitledRouteGate
      learning={profile}
      subscription={subscription}
      practiceSkill="reading"
    >
      <PracticeObjectiveResultsClient
        module="reading"
        hubId={hubId}
        attemptId={attemptId}
        fromPlan={fromPlan}
        planTaskId={planTaskId}
        planTask={planTask}
      />
    </EntitledRouteGate>
  );
}
