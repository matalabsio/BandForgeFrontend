import { StudyPlanFullClient } from "@/components/bandforge/study-plan/study-plan-full-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Full Plan · BandForge",
};

/** Auth gated in layout; profile loads client-side with skeleton + retry. */
export default async function StudyPlanPage() {
  return (
    <div className="relative space-y-5 pb-16">
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

      <StudyPlanFullClient />
    </div>
  );
}
