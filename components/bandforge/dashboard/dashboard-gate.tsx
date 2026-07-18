import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import type { LearningProfile } from "@/lib/learning-types";
import type { Subscription } from "@/lib/payments";

type Props = {
  learning: LearningProfile;
  subscription: Subscription;
  children: React.ReactNode;
};

/** @deprecated Use EntitledRouteGate — kept as alias for dashboard imports */
export function DashboardGate({ learning, subscription, children }: Props) {
  return (
    <EntitledRouteGate learning={learning} subscription={subscription}>
      {children}
    </EntitledRouteGate>
  );
}
