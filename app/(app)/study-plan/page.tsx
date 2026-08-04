import { PlanDayCalendar } from "@/components/bandforge/plan/plan-day-calendar";
import { fetchEntitledContext } from "@/lib/entitled-route-server";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Full Plan · BandForge",
};

/** Auth gated in layout; profile cached with layout's fetchEntitledContext. */
export default async function StudyPlanPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  const { profile } = await fetchEntitledContext(
    cookieHeader,
    user?.id ?? "",
  );

  const studyPlan = profile.study_plan;
  const examDate = profile.exam_date ?? studyPlan.exam_date ?? null;

  return (
    <div className="relative space-y-5 pb-4">
      <header className="max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
          Your schedule
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
          Full plan
        </h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
          Hover or tap any date to see that day&apos;s focus and tasks.
        </p>
      </header>

      {(studyPlan.weeks?.length ?? 0) > 0 ? (
        <PlanDayCalendar
          studyPlan={studyPlan}
          examDate={examDate}
          variant="page"
        />
      ) : (
        <div className="rounded-[28px] border border-white/60 bg-white/55 px-5 py-12 text-center shadow-[0_8px_40px_rgba(8,145,178,0.08)] backdrop-blur-xl">
          <p className="text-sm text-muted">
            No study plan days yet. Complete onboarding or open Today&apos;s
            plan to get started.
          </p>
        </div>
      )}
    </div>
  );
}
