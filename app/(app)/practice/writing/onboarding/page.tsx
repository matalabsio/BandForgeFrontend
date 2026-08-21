import { WritingSkillOnboardingClient } from "@/components/bandforge/practice/writing-skill-onboarding-client";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
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

  return <WritingSkillOnboardingClient />;
}
