import { redirect } from "next/navigation";
import { DashboardPlanPaywall } from "@/components/bandforge/dashboard/dashboard-plan-paywall";
import {
  resolveEntitledRoute,
  resolvePracticeEntitledRoute,
} from "@/lib/entitled-route";
import {
  FULL_SKILL_PROGRAM_SLUG,
  missingSkuForPracticeSkill,
  type PaywallSkuSlug,
} from "@/lib/entitlement";
import type { LearningProfile } from "@/lib/learning-types";
import type { Subscription } from "@/lib/payments";

type Props = {
  learning: LearningProfile;
  subscription: Subscription;
  children: React.ReactNode;
  /** When set, use practice skill-aware gate (Writing Skill can access writing). */
  practiceSkill?: string;
  /** Force a specific paywall SKU (defaults from practiceSkill or FSP). */
  paywallSlug?: PaywallSkuSlug;
};

export function EntitledRouteGate({
  learning,
  subscription,
  children,
  practiceSkill,
  paywallSlug,
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
    const targetSlug: PaywallSkuSlug =
      paywallSlug ??
      (practiceSkill
        ? (missingSkuForPracticeSkill(subscription, practiceSkill) ??
          FULL_SKILL_PROGRAM_SLUG)
        : FULL_SKILL_PROGRAM_SLUG);
    // Purchase CTA for the missing SKU (FSP routes → Buy Full Skill Program).
    return <DashboardPlanPaywall targetSlug={targetSlug} />;
  }

  return children;
}
