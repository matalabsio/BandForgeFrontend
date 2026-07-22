import { BrainCircuit, ShieldCheck } from "lucide-react";

type Reviewer = {
  display_name: string;
  credential_label?: string | null;
};

type Props = {
  band: number;
  descriptor: string;
  mode: "human" | "ai_estimate";
  reviewer?: Reviewer | null;
  releasedAtLabel?: string | null;
};

export function SpeakingReportHero({
  band,
  descriptor,
  mode,
  reviewer,
  releasedAtLabel,
}: Props) {
  const humanVerified = mode === "human";

  return (
    <section
      className="border-b border-border-soft bg-white px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10"
      aria-label={`Speaking band ${band.toFixed(1)}, ${descriptor}`}
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-left lg:gap-11">
        <div className="shrink-0">
          <p className="font-mono text-[4.75rem] leading-[0.9] font-medium tabular-nums text-cyan sm:text-[5.5rem] lg:text-[5.75rem]">
            {band.toFixed(1)}
          </p>
          <p className="mt-2 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
            Overall band
          </p>
        </div>

        <div className="min-w-0 flex-1 sm:border-l sm:border-border-soft sm:pl-8 lg:pl-9">
          <p className="font-display text-xl font-bold tracking-tight text-cyan sm:text-2xl">
            {descriptor}
          </p>

          {humanVerified ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="size-3.5" aria-hidden />
              Verified by a human examiner
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-900">
              <BrainCircuit className="size-3.5" aria-hidden />
              AI estimate · provisional
            </div>
          )}

          {reviewer ? (
            <p className="mt-3 text-sm font-light text-muted">
              Reviewed by {reviewer.display_name}
              {reviewer.credential_label ? ` · ${reviewer.credential_label}` : ""}
            </p>
          ) : humanVerified ? null : (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              This is an automated estimate, not your official IELTS band. A certified
              examiner will verify and release the final report.
            </p>
          )}

          {releasedAtLabel ? (
            <p className="mt-1 text-xs text-muted-light">{releasedAtLabel}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
