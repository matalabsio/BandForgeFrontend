import Link from "next/link";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

/**
 * Dashboard body when the user has no Full Skill Program yet.
 * Branches CTA on whether a diagnostic baseline already exists.
 */
export function DashboardPlanPaywall({
  hasDiagnostic = false,
}: {
  hasDiagnostic?: boolean;
}) {
  const title = hasDiagnostic
    ? "Your diagnostic is ready"
    : "No diagnostic results yet";
  const body = hasDiagnostic
    ? "Unlock the Full Skill Program to open your personalised dashboard, study plan, and practice path."
    : "Complete the free diagnostic to see your skill bands, then unlock a personalised Full Skill Program on your dashboard.";
  const ctaHref = hasDiagnostic
    ? diagnosticPaths.planReveal
    : diagnosticPaths.landing;
  const ctaLabel = hasDiagnostic
    ? "Unlock Full Skill Program"
    : "Start diagnostic";
  const eyebrow = hasDiagnostic ? "Next step" : "Free baseline";

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#E2EAF2] bg-[linear-gradient(165deg,#F7FBFD_0%,#FFFFFF_42%,#EEF9FB_100%)] px-5 py-10 sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] size-[280px] rounded-full bg-[radial-gradient(circle,rgba(0,169,192,0.18)_0%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-[-8%] size-[240px] rounded-full bg-[radial-gradient(circle,rgba(13,31,60,0.08)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-cyan uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-[1.75rem] leading-[1.12] font-bold tracking-[-0.03em] text-[#0D1F3C] sm:text-[2.125rem]">
          {title}
        </h2>
        <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-[#5A6B82] sm:text-base">
          {body}
        </p>

        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <Link
            href={ctaHref}
            prefetch
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-cyan px-7 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgb(0_151_167/0.28)] transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-brand-sky-hover"
          >
            {ctaLabel}
          </Link>
        </div>

        {!hasDiagnostic ? (
          <ul className="mt-9 grid w-full gap-2.5 text-left sm:grid-cols-3 sm:gap-3">
            {[
              "Listening + Reading",
              "Writing + Speaking",
              "~45 minutes total",
            ].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#E2EAF2]/80 bg-white/70 px-3.5 py-3 text-center text-[12.5px] font-medium text-[#475569] sm:text-[13px]"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
