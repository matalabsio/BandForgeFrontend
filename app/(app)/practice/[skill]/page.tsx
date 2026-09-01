import { notFound, redirect } from "next/navigation";
import { PracticeHubListExperience } from "@/components/bandforge/practice/practice-hub-list-experience";
import { SpeakingSkillCourseHome } from "@/components/bandforge/practice/speaking-skill-course-home";
import { WritingSkillCourseHome } from "@/components/bandforge/practice/writing-skill-course-home";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitlementGate } from "@/lib/entitled-route-server";
import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import {
  hasFullSkillProgram,
  hasSpeakingSkillPlan,
  hasWritingSkillPlan,
  WRITING_SKILL_ONBOARDING_PATH,
} from "@/lib/entitlement";
import { writingHubExerciseHref } from "@/lib/writing-skill-course";
import {
  fetchMockUnlock,
  fetchPracticeHubs,
  fetchPracticeHubsStatus,
} from "@/lib/practice-server";
import { isUuid } from "@/lib/mock-ids";
import { isPracticeSkill, practiceSkillLabel } from "@/lib/practice-types";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ skill: string }>;
  searchParams: Promise<{ hub?: string; mock?: string; unlock?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { skill } = await params;
  if (!isPracticeSkill(skill)) {
    return { title: "Practice · BandForge" };
  }
  return {
    title: `${practiceSkillLabel(skill)} Practice · BandForge`,
  };
}

export default async function PracticeSkillPage({
  params,
  searchParams,
}: PageProps) {
  const { skill } = await params;
  if (!isPracticeSkill(skill)) notFound();

  const sp = await searchParams;
  const hubParam = sp.hub?.trim() || null;
  if (hubParam && isUuid(hubParam)) {
    redirect(
      skill === "writing"
        ? writingHubExerciseHref(hubParam)
        : `/practice/${skill}/${hubParam}`,
    );
  }
  const mockLockedMessage = sp.mock === "locked";
  const hubLockedMessage = hubParam === "locked";
  const unlockAllForTesting = sp.unlock === "all" || sp.unlock === "1";

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, `/practice/${skill}`, cookieHeader);

  // Phase 4/6A: entitlement gate only — skip full learning profile assemble.
  const { profile, subscription } = await fetchEntitlementGate(
    cookieHeader,
    user!.id,
  );

  // Writing Skill pack without track → onboarding (usage.exam_module, not profile).
  if (
    skill === "writing" &&
    hasWritingSkillPlan(subscription) &&
    !hasFullSkillProgram(subscription)
  ) {
    const [hubsStatus, mockUnlock] = await Promise.all([
      fetchPracticeHubsStatus(cookieHeader, skill),
      fetchMockUnlock(cookieHeader, skill),
    ]);
    if (hubsStatus.status === "needs_track") {
      redirect(WRITING_SKILL_ONBOARDING_PATH);
    }
    const hubs =
      hubsStatus.status === "ok" ? hubsStatus.hubs : [];
    const visibleHubs = unlockAllForTesting
      ? hubs.map((hub) => ({
          ...hub,
          accessible: true,
          locked_reason: null,
        }))
      : hubs;

    return (
      <EntitledRouteGate
        learning={profile}
        subscription={subscription}
        practiceSkill={skill}
      >
        <WritingSkillCourseHome
          hubs={visibleHubs}
          mockUnlock={mockUnlock}
          mockLockedMessage={mockLockedMessage}
          hubLockedMessage={hubLockedMessage}
        />
      </EntitledRouteGate>
    );
  }

  // Speaking Skill pack — sequential course home (no track onboarding).
  if (
    skill === "speaking" &&
    hasSpeakingSkillPlan(subscription) &&
    !hasFullSkillProgram(subscription)
  ) {
    const [hubs, mockUnlock] = await Promise.all([
      fetchPracticeHubs(cookieHeader, skill),
      fetchMockUnlock(cookieHeader, skill),
    ]);
    const visibleHubs = unlockAllForTesting
      ? (hubs ?? []).map((hub) => ({
          ...hub,
          accessible: true,
          locked_reason: null,
        }))
      : (hubs ?? []);

    return (
      <EntitledRouteGate
        learning={profile}
        subscription={subscription}
        practiceSkill={skill}
      >
        <SpeakingSkillCourseHome
          hubs={visibleHubs}
          mockUnlock={mockUnlock}
          mockLockedMessage={mockLockedMessage}
          hubLockedMessage={hubLockedMessage}
        />
      </EntitledRouteGate>
    );
  }

  const [hubs, mockUnlock] = await Promise.all([
    fetchPracticeHubs(cookieHeader, skill),
    fetchMockUnlock(cookieHeader, skill),
  ]);
  const visibleHubs = unlockAllForTesting
    ? (hubs ?? []).map((hub) => ({
        ...hub,
        accessible: true,
        locked_reason: null,
      }))
    : (hubs ?? []);

  return (
    <EntitledRouteGate
      learning={profile}
      subscription={subscription}
      practiceSkill={skill}
    >
      <PracticeHubListExperience
        skill={skill}
        hubs={visibleHubs}
        mockUnlock={mockUnlock}
        mockLockedMessage={mockLockedMessage}
        hubLockedMessage={hubLockedMessage}
      />
    </EntitledRouteGate>
  );
}
