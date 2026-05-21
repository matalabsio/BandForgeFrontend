import { BfHeroCtas } from "@/components/bandforge/bf-hero-ctas";
import { IconClock } from "@/components/icons";

function HeroExamPreview() {
  return (
    <div className="relative mx-auto max-w-xl lg:max-w-none" aria-hidden>
      <div className="bf-parallax-slow absolute -right-4 -top-5 z-10 hidden rounded-2xl border border-teal/15 bg-white/90 px-4 py-3 shadow-[0_20px_60px_-32px_rgb(13_31_60_/_0.45)] backdrop-blur sm:block">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink/45">
          Current band
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-navy">6.5</p>
      </div>
      <div className="bf-parallax-fast absolute -bottom-5 -left-3 z-10 hidden rounded-2xl border border-border bg-white/90 px-4 py-3 shadow-[0_20px_60px_-32px_rgb(13_31_60_/_0.45)] backdrop-blur md:block">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink/45">
          Next drill
        </p>
        <p className="mt-1 text-sm font-semibold text-navy">Task 2 cohesion · 15 min</p>
      </div>

      <div className="bf-min-card bf-soft-shine overflow-hidden p-3 sm:p-4">
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_14px_rgb(0_188_212_/_0.75)]" />
            <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink/45 sm:text-meta">
              Academic mock · Module 2
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/8 px-2.5 py-1 font-mono text-[0.6875rem] font-semibold tabular-nums text-amber-700 sm:text-body">
            <IconClock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            58:42
          </div>
        </div>

          <div className="grid gap-3 pt-4 lg:grid-cols-[140px_1fr] lg:gap-4">
          <div className="flex flex-row gap-2 lg:flex-col lg:gap-2">
            {(
              [
                { k: "R", v: "7.0", a: 88 },
                { k: "L", v: "7.5", a: 92 },
                { k: "W", v: "6.5", a: 72 },
                { k: "S", v: "6.5", a: 70 },
              ] as const
            ).map((s) => (
              <div
                key={s.k}
                className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-surface/70 px-2 py-2 sm:px-3"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-meta font-bold text-ink/35">
                    {s.k}
                  </span>
                  <span className="text-body font-bold text-navy">
                    {s.v}
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal to-teal-light"
                    style={{ width: `${s.a}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface/70 p-3">
              <p className="text-meta font-semibold uppercase tracking-wider text-ink/45">
                Speaking · Part 2
              </p>
              <div className="mt-3 flex h-14 items-end justify-between gap-0.5 px-0.5">
                {[
                  12, 28, 18, 40, 22, 55, 35, 48, 30, 62, 38, 50, 28, 44, 20,
                  36, 24, 52, 33, 46,
                ].map((h, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full bg-gradient-to-t from-teal/20 to-teal"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-[0.625rem] text-ink/45">
                AI + human review queued
              </p>
            </div>

              <div className="rounded-2xl border border-border bg-surface/70 p-3">
              <p className="text-meta font-semibold uppercase tracking-wider text-ink/45">
                Writing · Task 2
              </p>
              <p className="mt-2 line-clamp-2 text-[0.6875rem] leading-relaxed text-ink/58">
                Lexical resource shows good range; cohesion could be tightened
                in body paragraph 2…
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["TR 7.0", "CC 6.5", "LR 7.0", "GRA 6.5"].map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-teal/20 bg-teal/8 px-1.5 py-0.5 text-[0.625rem] font-medium text-teal"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export function BandForgeHero() {
  return (
    <section
      className="relative overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-16 lg:pb-28"
      aria-labelledby="bf-hero-heading"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(72rem,88vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal/10 blur-[90px]" />
      <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-navy/5 blur-[100px]" />

      <div className="bf-container relative">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-x-20 lg:gap-y-16">
          <div className="min-w-0 max-w-2xl lg:max-w-none">
            <p className="bf-reveal bf-eyebrow">
              AI-first products for learning
            </p>
            <h1
              id="bf-hero-heading"
              className="bf-reveal bf-delay-1 mt-5 max-w-4xl font-display text-[2.5rem] font-bold leading-[1] tracking-[-0.055em] text-navy sm:text-6xl lg:text-7xl xl:text-[5rem]"
            >
              IELTS prep that feels like the real exam.
            </h1>
            <p className="bf-reveal bf-delay-2 mt-6 max-w-xl text-base leading-7 text-ink/68 sm:text-lg">
              Realistic simulation, instant evaluation, and personalised prep loops
              — built for Telugu-speaking students targeting Band 7+ without
              expensive coaching gatekeeping.
            </p>
            <BfHeroCtas />
          </div>

          <div className="bf-reveal bf-delay-2 relative min-w-0 lg:translate-y-4">
            <HeroExamPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
