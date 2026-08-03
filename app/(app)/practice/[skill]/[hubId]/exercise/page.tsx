import { notFound, redirect } from "next/navigation";
import { PracticeExerciseExperience } from "@/components/bandforge/practice/practice-exercise-experience";
import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitlementGate } from "@/lib/entitled-route-server";
import { isUuid } from "@/lib/mock-ids";
import {
  planListeningModuleHref,
  planReadingModuleHref,
  planWritingModuleHref,
  type PlanTaskKind,
} from "@/lib/plan-task-flow";
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

export async function generateMetadata({ params }: PageProps) {
  const { skill } = await params;
  if (!isPracticeSkill(skill)) {
    return { title: "Practice · BandForge" };
  }
  return {
    title: `${practiceSkillLabel(skill)} Exercise · BandForge`,
  };
}

export default async function PracticeExercisePage({
  params,
  searchParams,
}: PageProps) {
  const { skill, hubId } = await params;
  const sp = await searchParams;
  if (!isPracticeSkill(skill) || !isUuid(hubId)) notFound();

  const fromPlan = firstParam(sp.from) === "plan";
  const planTaskId = firstParam(sp.taskId);
  const planTaskRaw = firstParam(sp.task);
  const planTask: PlanTaskKind =
    planTaskRaw === "watch" ||
    planTaskRaw === "practice" ||
    planTaskRaw === "submit"
      ? planTaskRaw
      : "practice";

  // Writing / Listening / Reading plan practice uses real MT exam UI, not bank smoke.
  if (fromPlan && skill === "listening") {
    redirect(
      planListeningModuleHref({
        hubId,
        task: planTask,
        taskId: planTaskId,
      }),
    );
  }
  if (fromPlan && skill === "reading") {
    redirect(
      planReadingModuleHref({
        hubId,
        task: planTask,
        taskId: planTaskId,
      }),
    );
  }
  if (fromPlan && skill === "writing") {
    redirect(
      planWritingModuleHref({
        hubId,
        task: planTask,
        taskId: planTaskId,
        bankNumber: 1,
      }),
    );
  }

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(
    user,
    `/practice/${skill}/${hubId}/exercise`,
    cookieHeader,
  );

  const { profile, subscription } = await fetchEntitlementGate(
    cookieHeader,
    user!.id,
  );

  return (
    <EntitledRouteGate learning={profile} subscription={subscription}>
      <PracticeExerciseExperience
        skill={skill}
        hubId={hubId}
        fromPlan={fromPlan}
        planTaskId={planTaskId}
        planTask={planTaskRaw}
      />
    </EntitledRouteGate>
  );
}
