import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitlementGate } from "@/lib/entitled-route-server";
import {
  hasFullSkillProgram,
  hasWritingSkillPlan,
  WRITING_PRACTICE_PATH,
} from "@/lib/entitlement";
import { PRACTICE_SKILLS, practiceSkillLabel } from "@/lib/practice-types";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Practice · BandForge",
};

const SKILL_ICON = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
} as const;

const SKILL_COPY = {
  listening: "Audio sets and question practice",
  reading: "Passages, timing, and question types",
  writing: "Task 1 & 2 with AI feedback",
  speaking: "Cue cards, parts, and fluency",
} as const;

export default async function PracticeIndexPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, "/practice", cookieHeader);

  const { profile, subscription } = await fetchEntitlementGate(
    cookieHeader,
    user!.id,
  );

  // Writing Skill-only: course home, not the four-skill practice index.
  if (
    hasWritingSkillPlan(subscription) &&
    !hasFullSkillProgram(subscription)
  ) {
    redirect(WRITING_PRACTICE_PATH);
  }

  return (
    <EntitledRouteGate learning={profile} subscription={subscription}>
      <div className="space-y-6 pb-2">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
            Skill practice
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
            Practice
          </h1>
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-muted">
            Pick a skill and finish its hubs. Full mock tests unlock after you
            complete the whole practice plan.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {PRACTICE_SKILLS.map((skill) => {
            const Icon = SKILL_ICON[skill];
            return (
              <Link
                key={skill}
                href={`/practice/${skill}`}
                className="group flex items-start gap-3.5 rounded-2xl border border-ink/8 bg-white px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-cyan/35 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] sm:px-5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-soft text-teal">
                  <Icon className="size-5" strokeWidth={2.1} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15px] font-bold text-ink">
                    {practiceSkillLabel(skill)}
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {SKILL_COPY[skill]}
                  </p>
                  <p className="mt-2 text-[12px] font-semibold text-teal transition-transform duration-200 group-hover:translate-x-0.5">
                    Open hubs →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </EntitledRouteGate>
  );
}
