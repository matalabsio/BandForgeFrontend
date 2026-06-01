export function BandForgeMobile() {
  return (
    <section
      id="mobile"
      className="bf-section border-y border-border/70 bg-gradient-to-b from-surface/70 to-white"
    >
      <div className="bf-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="bf-eyebrow">
              Mobile-first
            </p>
            <h2 className="bf-section-title mt-3">
              Built for students who learn on their phones.
            </h2>
            <p className="bf-copy mt-5 max-w-xl">
              BandForge is designed from 375px up: readable passages, thumb-safe
              controls, and a PWA path so serious practice is not chained to a
              desktop lab.
            </p>
            <ul className="mt-8 space-y-3 text-body text-ink/75">
              <li className="flex gap-2">
                <span className="font-semibold text-teal">Install</span>
                Add to home screen for quick launch like a native app.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-teal">Test UI</span>
                Full-width reading, tap-to-select listening, structured writing.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-teal">Analytics</span>
                Bands and trends readable on small screens, no squinting.
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 lg:justify-end">
            <div className="bf-phone bf-parallax-slow relative w-[200px] shrink-0 sm:w-[220px]">
              <div className="rounded-[2rem] border border-ink/10 bg-navy p-2 shadow-[var(--shadow-elevated)]">
                <div className="overflow-hidden rounded-[1.65rem] bg-white">
                  <div className="border-b border-border bg-surface px-3 py-2">
                    <div className="mx-auto h-1 w-12 rounded-full bg-ink/15" />
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="h-2 max-w-[78%] rounded bg-ink/10" />
                    <div className="h-2 w-full rounded bg-ink/8" />
                    <div className="h-2 max-w-[90%] rounded bg-ink/8" />
                    <div className="mt-3 grid grid-cols-4 gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded border border-navy/15 bg-white text-[0.5rem] font-semibold text-navy/60 flex items-center justify-center"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 h-8 rounded-lg bg-teal/15" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bf-phone bf-parallax-fast relative w-[200px] shrink-0 sm:w-[220px]">
              <div className="rounded-[2rem] border border-ink/10 bg-navy p-2 shadow-[var(--shadow-elevated)]">
                <div className="overflow-hidden rounded-[1.65rem] bg-white">
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-center text-meta font-semibold text-navy">
                      Score report
                    </p>
                  </div>
                  <div className="p-3">
                    <div className="flex items-end justify-center gap-1">
                      {[35, 55, 42, 70].map((h, i) => (
                        <div
                          key={i}
                          className="w-5 rounded-t bg-gradient-to-t from-navy to-teal"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-center text-h3 font-bold text-navy">
                      6.5
                    </p>
                    <p className="text-center text-meta text-ink/50">
                      Overall (mock)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
