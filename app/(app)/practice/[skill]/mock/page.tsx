import { notFound, redirect } from "next/navigation";
import { DashboardPlanPaywall } from "@/components/bandforge/dashboard/dashboard-plan-paywall";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitledContext } from "@/lib/entitled-route-server";
import { resolveEntitledRoute } from "@/lib/entitled-route";
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

  const { profile, subscription } = await fetchEntitledContext(
    cookieHeader,
    user!.id,
  );

  const entitled = resolveEntitledRoute({ learning: profile, subscription });
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
