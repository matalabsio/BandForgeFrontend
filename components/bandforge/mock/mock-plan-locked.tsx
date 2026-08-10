import Link from "next/link";

/** Shown on /test until the practice plan is fully complete. */
export function MockPlanLocked() {
  return (
    <section className="mx-auto max-w-lg py-10 text-center sm:py-14">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
        Mock tests
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
        Finish your practice plan first
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Full mock tests unlock after you complete every practice hub in your
        plan. Keep going — then come back here.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/practice"
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-cyan px-5 text-[14px] font-bold text-navy transition-colors duration-200 hover:bg-brand-sky-hover"
        >
          Continue practice
        </Link>
        <Link
          href="/study-plan"
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-ink/10 bg-white px-5 text-[14px] font-semibold text-ink transition-colors duration-200 hover:border-cyan/35 hover:text-teal"
        >
          View full plan
        </Link>
      </div>
    </section>
  );
}
