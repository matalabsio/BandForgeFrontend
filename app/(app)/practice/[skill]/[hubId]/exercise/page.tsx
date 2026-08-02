import { notFound } from "next/navigation";
import { PracticeExerciseExperience } from "@/components/bandforge/practice/practice-exercise-experience";
import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitledContext } from "@/lib/entitled-route-server";
import { isUuid } from "@/lib/mock-ids";
import { isPracticeSkill, practiceSkillLabel } from "@/lib/practice-types";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ skill: string; hubId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { skill } = await params;
  if (!isPracticeSkill(skill)) {
    return { title: "Practice · BandForge" };
  }
  return {
    title: `${practiceSkillLabel(skill)} Exercise · BandForge`,
  };
}

export default async function PracticeExercisePage({ params }: PageProps) {
  const { skill, hubId } = await params;
  if (!isPracticeSkill(skill) || !isUuid(hubId)) notFound();

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(
    user,
    `/practice/${skill}/${hubId}/exercise`,
    cookieHeader,
  );

  const { profile, subscription } = await fetchEntitledContext(
    cookieHeader,
    user!.id,
  );

  return (
    <EntitledRouteGate learning={profile} subscription={subscription}>
      <PracticeExerciseExperience skill={skill} hubId={hubId} />
    </EntitledRouteGate>
  );
}
