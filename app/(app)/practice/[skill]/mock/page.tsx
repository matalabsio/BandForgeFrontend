import { notFound, redirect } from "next/navigation";
import { DashboardPlanPaywall } from "@/components/bandforge/dashboard/dashboard-plan-paywall";
import { WritingSkillMockLaunch } from "@/components/bandforge/practice/writing-skill-mock-launch";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import {
  fetchEntitledContext,
  fetchEntitlementGate,
} from "@/lib/entitled-route-server";
import {
  resolveEntitledRoute,
  resolvePracticeEntitledRoute,
} from "@/lib/entitled-route";
import {
  hasFullSkillProgram,
  hasWritingSkillPlan,
} from "@/lib/entitlement";
import { shortModuleExamPath } from "@/lib/mock-catalog";
import { appendSkillContext } from "@/lib/practice-submit";
import { fetchMockUnlock } from "@/lib/practice-server";
import { isPracticeSkill, type PracticeSkill } from "@/lib/practice-types";
import { writingTaskPath } from "@/lib/writing-test";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ skill: string }>;
};

function moduleShortcutForSkill(skill: PracticeSkill): string {
  switch (skill) {
    case "writing":
      return writingTaskPath(1, { auto: true });
    case "speaking":
      return shortModuleExamPath(1, "speaking");
    case "listening":
      return shortModuleExamPath(1, "listening");
    case "reading":
      return shortModuleExamPath(1, "reading");
  }
}

export default async function PracticeSkillMockPage({ params }: PageProps) {
  const { skill } = await params;
  if (!isPracticeSkill(skill)) notFound();

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, `/practice/${skill}/mock`, cookieHeader);

  const { profile, subscription } = await fetchEntitlementGate(
    cookieHeader,
    user!.id,
  );

  // Writing Skill-only: practice gate + allotted mock (never generic premium mock).
  if (
    skill === "writing" &&
    hasWritingSkillPlan(subscription) &&
    !hasFullSkillProgram(subscription)
  ) {
    const entitled = resolvePracticeEntitledRoute({
      learning: profile,
      subscription,
      skill: "writing",
    });
    if (entitled.kind === "redirect") redirect(entitled.path);
    if (entitled.kind === "paywall") return <DashboardPlanPaywall />;

    const mockUnlock = await fetchMockUnlock(cookieHeader, skill);
    if (!mockUnlock?.unlocked || !mockUnlock.mock_test_id) {
      redirect("/practice/writing?mock=locked");
    }
    return <WritingSkillMockLaunch mockTestId={mockUnlock.mock_test_id} />;
  }

  // FSP (and dual-SKU FSP-first): existing mock shortcut.
  const entitledCtx = await fetchEntitledContext(cookieHeader, user!.id);
  const entitled = resolveEntitledRoute({
    learning: entitledCtx.profile,
    subscription: entitledCtx.subscription,
  });
  if (entitled.kind === "redirect") {
    redirect(entitled.path);
  }
  if (entitled.kind === "paywall") {
    return <DashboardPlanPaywall />;
  }

  const mockUnlock = await fetchMockUnlock(cookieHeader, skill);
  if (!mockUnlock?.unlocked) {
    redirect(`/practice/${skill}?mock=locked`);
  }

  redirect(appendSkillContext(moduleShortcutForSkill(skill), skill));
}
