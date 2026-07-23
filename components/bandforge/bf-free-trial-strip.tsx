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

  return (
    <section
      aria-label="Free trial benefits"
      className="overflow-x-hidden border-y border-border/70 bg-white/70 py-4 backdrop-blur sm:py-5"
    >
      <BfAutoMarquee
        aria-label="Free trial highlights"
        speed={26}
        mobileLoopDuration="30s"
      >
        <ul className="bf-marquee-track gap-2.5 pr-2.5 sm:gap-3 sm:pr-3">
          {items.map((t) => (
            <li
              key={t}
              className="flex max-w-[min(88vw,320px)] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-white px-3.5 py-2 text-[0.75rem] font-medium text-ink/70 shadow-[var(--shadow-soft)] sm:max-w-none sm:px-4 sm:text-body"
            >
              <span
                className="size-1.5 shrink-0 rounded-full bg-teal shadow-[0_0_8px_rgb(0_188_212_/_0.55)]"
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
