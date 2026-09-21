import { notFound, redirect } from "next/navigation";
import { PracticeExerciseExperience } from "@/components/bandforge/practice/practice-exercise-experience";
import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitlementGate } from "@/lib/entitled-route-server";
import { fetchPlanShortLink } from "@/lib/learning-server";
import {
  planStepOpenHref,
  type PlanTaskKind,
} from "@/lib/plan-task-flow";
import { isOpaquePlanShortCode } from "@/lib/plan-short-path";
import {
  FSP_PRACTICE_BROWSE_REDIRECT,
  isFspPracticeBrowseRestricted,
} from "@/lib/practice-browse-gate";
import {
  isBankSubmitTarget,
  isModuleSubmitTarget,
} from "@/lib/practice-submit";
import { fetchPracticeHub, isHubLockedError } from "@/lib/practice-server";
import { isPracticeSkill, practiceSkillLabel } from "@/lib/practice-types";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  if (!isOpaquePlanShortCode(code)) {
    return { title: "Practice · BandForge" };
  }
  const cookieHeader = await getCachedCookieHeader();
  const link = await fetchPlanShortLink(cookieHeader, code);
  if (!link || !isPracticeSkill(link.skill)) {
    return { title: "Practice · BandForge" };
  }
  return {
    title: `${practiceSkillLabel(link.skill)} Exercise · BandForge`,
  };
}

/**
 * Opaque plan deep link: /p/{code}
 * Bank hubs render the exercise in place.
 * Module hubs redirect once to /test/...
 */
export default async function PlanOpaqueShortPage({ params }: PageProps) {
  const { code: codeRaw } = await params;
  const code = codeRaw?.trim() ?? "";
  if (!isOpaquePlanShortCode(code)) notFound();

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, `/p/${code}`, cookieHeader);

  const link = await fetchPlanShortLink(cookieHeader, code);
  // Stale catch-up bookmarks (pre-rematerialize codes) should not 404 the app.
  if (!link || !isPracticeSkill(link.skill)) {
    redirect("/study-plan/today?hub=gone");
  }

  const skill = link.skill;
  const hubId = link.hub_id;
  const planTask: PlanTaskKind =
    link.task_type === "watch" ||
    link.task_type === "practice" ||
    link.task_type === "submit"
      ? link.task_type
      : "practice";
  const taskId = link.task_id;
  const fromPlan = true;
  const planContext = true;

  let hub: Awaited<ReturnType<typeof fetchPracticeHub>>;
  let profile: Awaited<ReturnType<typeof fetchEntitlementGate>>["profile"];
  let subscription: Awaited<
    ReturnType<typeof fetchEntitlementGate>
  >["subscription"];
  try {
    [hub, { profile, subscription }] = await Promise.all([
      fetchPracticeHub(cookieHeader, hubId),
      fetchEntitlementGate(cookieHeader, user!.id),
    ]);
  } catch (e) {
    if (isHubLockedError(e)) {
      redirect("/study-plan/today?hub=locked");
    }
    throw e;
  }

  // Stale catch-up short links can resolve to hubs removed from the catalog.
  if (!hub) {
    redirect("/study-plan/today?hub=gone");
  }

  if (isFspPracticeBrowseRestricted(subscription) && !planContext) {
    redirect(FSP_PRACTICE_BROWSE_REDIRECT);
  }

  const submitConfig = (hub.submit_config ?? {}) as {
    type?: string;
    catalog_number?: number;
    part?: number;
    href?: string;
  };

  if (!isBankSubmitTarget(submitConfig) && isModuleSubmitTarget(submitConfig)) {
    redirect(
      planStepOpenHref({
        skill,
        hubId,
        task: planTask,
        taskId,
        bankNumber: hub.bank_number,
        catalogNumber: submitConfig.catalog_number,
        part: submitConfig.part,
        submitConfig,
      }),
    );
  }

  return (
    <EntitledRouteGate
      learning={profile}
      subscription={subscription}
      practiceSkill={skill}
    >
      <PracticeExerciseExperience
        skill={skill}
        hubId={hubId}
        fromPlan={fromPlan}
        planTaskId={taskId}
        planTask={planTask}
      />
    </EntitledRouteGate>
  );
}
