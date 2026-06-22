const stories = [
  {
    quote:
      "Speaking feedback was the first time someone explained my fillers and pacing like a human examiner would — not just a number.",
    name: "Ananya K.",
    meta: "Hyderabad · target Canada PR · 6.5 → 7.5 speaking",
  },
  {
    quote:
      "Mocks felt like the real CDI format. I stopped panicking about the timer because I had already lived it ten times on my phone.",
    name: "Rohit V.",
    meta: "Vijayawada · MSc UK admit · overall 5.5 → 7.0",
  },
  {
    quote:
      "Writing comments were blunt in a good way — exactly which paragraph to rewrite and why. Cheaper than my weekend crash course.",
    name: "Sneha M.",
    meta: "Bengaluru · first-gen abroad · scholarship track",
  },
] as const;

export function BandForgeTestimonials() {
  return (
    <section id="stories" className="bf-section bg-white/40">
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">
            Testimonials
          </p>
          <h2 className="font-display mt-3 text-[1.625rem] leading-[1.1] font-bold tracking-[-0.025em] text-balance text-navy sm:text-[2rem] sm:leading-[1.08] lg:text-[2.375rem]">
            Confidence grows when practice feels real.
          </h2>
        </div>

        <ul className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <li
              key={s.name}
              className="bf-min-card flex flex-col p-6 sm:p-8"
            >
              <blockquote className="flex-1 text-body leading-relaxed text-ink/80">
                “{s.quote}”
              </blockquote>
              <footer className="mt-6 border-t border-border pt-4">
                <p className="text-body font-semibold text-navy">{s.name}</p>
                <p className="mt-0.5 text-meta text-ink/55">{s.meta}</p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
