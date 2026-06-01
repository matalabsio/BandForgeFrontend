import Link from "next/link";

export function BandForgeDemo() {
  return (
    <section
      id="demo"
      className="bf-section relative overflow-hidden bg-navy text-white"
    >
      <div className="bf-grid-bg pointer-events-none absolute inset-0 opacity-30" />
      <div className="bf-container relative">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_90px_-50px_rgb(0_188_212_/_0.45)] sm:p-10 lg:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-meta font-semibold uppercase tracking-[0.18em] text-teal-light">
              Product tour
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Watch how a mock flows end-to-end.
            </h2>
            <p className="mt-4 text-body leading-relaxed text-white/65">
              A short walkthrough of navigation, timers, submission, and the
              feedback dashboard: no stock footage, just the actual product
              philosophy rendered in UI.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <div className="bf-soft-shine relative aspect-video overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#0a1628] to-navy shadow-[0_24px_60px_-20px_rgba(0,188,212,0.25)]">
              <div className="bf-grid-fine absolute inset-0 opacity-30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                <div className="flex size-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                  <svg
                    className="ml-1 size-7 text-teal-light"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </div>
                <p className="max-w-sm text-center text-meta leading-relaxed text-white/50">
                  Video embed ships next; explore the{" "}
                  <Link
                    href="/ai-feedback"
                    className="font-semibold text-teal-light underline-offset-2 hover:underline"
                  >
                    AI evaluation previews
                  </Link>{" "}
                  above, or{" "}
                  <Link
                    href="/contact?topic=demo"
                    className="font-semibold text-teal-light underline-offset-2 hover:underline"
                  >
                    request a live walkthrough
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
