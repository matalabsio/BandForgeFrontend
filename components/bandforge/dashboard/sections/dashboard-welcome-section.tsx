type Props = {
  firstName: string;
  targetBand: number | null;
  currentDay: number | null;
  totalDays: number | null;
  weeklyFocus?: string | null;
  skillDifficulty?: Record<string, string> | null;
};

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"] as const;

const SKILL_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export function DashboardWelcomeSection({
  firstName,
  targetBand,
  currentDay,
  totalDays,
  weeklyFocus = null,
  skillDifficulty = null,
}: Props) {
  const targetLabel =
    targetBand != null && targetBand > 0 ? targetBand.toFixed(1) : "—";
  const dayLine =
    currentDay != null && totalDays != null && totalDays > 0
      ? `You're on Day ${currentDay} of your IELTS preparation.`
      : "Your personalised IELTS preparation starts here.";

  const focusLine =
    weeklyFocus && weeklyFocus.trim()
      ? weeklyFocus.trim().replace(/^Focus:\s*/i, "")
      : null;

  const chips = SKILL_ORDER.filter((key) => {
    const tag = skillDifficulty?.[key];
    return tag === "hard" || tag === "easy";
  });

  return (
    <section className="bf-dash-enter rounded-2xl border border-ink/10 bg-white px-5 py-5 sm:px-6 sm:py-6">
      <p className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
        Welcome, {firstName}!
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink/60 sm:text-[15px]">
        <span className="font-semibold text-ink">Target Band:</span> {targetLabel}
        <span className="mx-2 text-ink/25">·</span>
        {dayLine}
      </p>
      {focusLine ? (
        <p className="mt-2 text-[14px] font-semibold text-cyan sm:text-[15px]">
          Focus: {focusLine}
        </p>
      ) : null}
      {chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((key) => {
            const tag = skillDifficulty?.[key];
            const hard = tag === "hard";
            return (
              <span
                key={key}
                className={
                  hard
                    ? "inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
                    : "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                }
              >
                {SKILL_LABEL[key]} · {hard ? "Hard" : "Easy"}
              </span>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
