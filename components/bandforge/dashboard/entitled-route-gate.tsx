import { redirect } from "next/navigation";
import { DashboardPlanPaywall } from "@/components/bandforge/dashboard/dashboard-plan-paywall";
import { resolveEntitledRoute } from "@/lib/entitled-route";
import type { LearningProfile } from "@/lib/learning-types";
import type { Subscription } from "@/lib/payments";

type Props = {
  learning: LearningProfile;
  subscription: Subscription;
  children: React.ReactNode;
};

export function EntitledRouteGate({ learning, subscription, children }: Props) {
  const result = resolveEntitledRoute({ learning, subscription });

  if (result.kind === "redirect") {
    redirect(result.path);
  }

  if (result.kind === "paywall") {
    return <DashboardPlanPaywall />;
  }

  return children;
}
