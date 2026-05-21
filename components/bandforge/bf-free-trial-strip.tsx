import { BfAutoMarquee } from "@/components/bandforge/bf-auto-marquee";

export function BandForgeFreeTrialStrip() {
  const items = [
    "Free trial · No password",
    "Start with a free diagnostic mock test",
    "Instant Reading & Listening scoring",
    "AI-powered Writing evaluation",
    "Speaking feedback with AI + human review",
    "Sign in only when you start a mock or save progress",
  ] as const;
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Free trial benefits"
      className="border-y border-border/70 bg-white/70 py-4 backdrop-blur sm:py-5"
    >
      <BfAutoMarquee aria-label="Free trial highlights" speed={26}>
        <ul className="bf-marquee-track gap-3 pr-3">
          {loop.map((t, index) => (
            <li
              key={`${t}-${index}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-[0.8125rem] font-medium text-ink/70 shadow-[var(--shadow-soft)] sm:text-body"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal shadow-[0_0_8px_rgb(0_188_212_/_0.55)]"
                aria-hidden
              />
              {t}
            </li>
          ))}
        </ul>
      </BfAutoMarquee>
    </section>
  );
}
