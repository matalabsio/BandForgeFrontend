import { FlameIcon } from "@/components/bandforge/dashboard/icons";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { BRAND_STREAK } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

export function StreakTrackerExperience() {
  return (
    <div className="space-y-8">
      <header>
        <BfSectionEyebrow>Habits</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Streak tracker</BfSectionHeading>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#f5d9a8] bg-gradient-to-br from-[#fff8eb] via-white to-[#fff3db] p-8 text-center shadow-sm">
        <FlameIcon className="mx-auto size-14 text-[#e8a317]" />
        <p className="font-display mt-4 bg-gradient-to-r from-[#e8a317] to-[#f06b1d] bg-clip-text text-6xl font-extrabold text-transparent">
          {BRAND_STREAK.current}
        </p>
        <p className="mt-1 text-sm font-medium text-navy">day streak — keep it going!</p>
        <p className="mt-2 font-mono text-xs text-muted-light">
          Longest: {BRAND_STREAK.longest} days
        </p>
      </section>

      <section>
        <h2 className="font-display text-sm font-bold text-navy">This week</h2>
        <div className="mt-4 flex justify-between gap-2">
          {BRAND_STREAK.weekDays.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full text-sm font-semibold",
                  d.active
                    ? "bg-cyan text-white"
                    : "today" in d && d.today
                      ? "animate-pulse border-2 border-cyan bg-white text-cyan"
                      : "bg-border-soft text-muted-light",
                )}
              >
                {d.label}
              </div>
            </div>
          ))}
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-4 rounded-xl border border-border-soft bg-white p-4 text-center">
          <div>
            <dt className="font-mono text-lg text-cyan">{BRAND_STREAK.weekStats.tests}</dt>
            <dd className="text-xs text-muted-light">Tests</dd>
          </div>
          <div>
            <dt className="font-mono text-lg text-cyan">{BRAND_STREAK.weekStats.tasks}</dt>
            <dd className="text-xs text-muted-light">Tasks</dd>
          </div>
          <div>
            <dt className="font-mono text-lg text-cyan">
              {BRAND_STREAK.weekStats.studyTime}
            </dt>
            <dd className="text-xs text-muted-light">Study time</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border-soft bg-white p-6">
        <h2 className="font-display text-sm font-bold text-navy">Next milestone</h2>
        {BRAND_STREAK.milestones
          .filter((m) => !m.reached)
          .slice(0, 1)
          .map((m) => (
            <div key={m.days} className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-navy">{m.label}</span>
                <span className="font-mono text-xs text-muted-light">{m.days} days</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-border-soft">
                <div
                  className="h-full rounded-full bg-cyan"
                  style={{ width: `${m.progress}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[0.625rem] text-muted-light">
                <span>0</span>
                <span>{m.days}</span>
              </div>
            </div>
          ))}
      </section>

      <section className="rounded-2xl border border-cyan/20 bg-cyan-soft/40 p-5">
        <p className="text-sm leading-relaxed text-muted">{BRAND_STREAK.insight}</p>
      </section>
    </div>
  );
}
