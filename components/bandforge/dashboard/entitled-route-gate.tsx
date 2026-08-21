import { redirect } from "next/navigation";
import { DashboardPlanPaywall } from "@/components/bandforge/dashboard/dashboard-plan-paywall";
import {
  resolveEntitledRoute,
  resolvePracticeEntitledRoute,
} from "@/lib/entitled-route";
import type { LearningProfile } from "@/lib/learning-types";
import type { Subscription } from "@/lib/payments";

type Props = {
  learning: LearningProfile;
  subscription: Subscription;
  children: React.ReactNode;
  /** When set, use practice skill-aware gate (Writing Skill can access writing). */
  practiceSkill?: string;
};

export function EntitledRouteGate({
  learning,
  subscription,
  children,
  practiceSkill,
}: Props) {
  const result = practiceSkill
    ? resolvePracticeEntitledRoute({
        learning,
        subscription,
        skill: practiceSkill,
      })
    : resolveEntitledRoute({ learning, subscription });

  if (result.kind === "redirect") {
    redirect(result.path);
  }

  if (result.kind === "paywall") {
    return <DashboardPlanPaywall />;
  }

  return children;
}
