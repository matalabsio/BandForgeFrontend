import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import { WritingSkillOnboardingClient } from "@/components/bandforge/practice/writing-skill-onboarding-client";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitlementGate } from "@/lib/entitled-route-server";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Choose Writing track · BandForge",
};

export default async function WritingSkillOnboardingPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, "/practice/writing/onboarding", cookieHeader);

  const { profile, subscription } = await fetchEntitlementGate(
    cookieHeader,
    user!.id,
  );

  return (
    <EntitledRouteGate
      learning={profile}
      subscription={subscription}
      practiceSkill="writing"
    >
      <WritingSkillOnboardingClient />
    </EntitledRouteGate>
  );
}
