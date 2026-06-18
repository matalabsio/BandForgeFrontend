import { SparkleIcon } from "@/components/bandforge/dashboard/icons";
import { INK, PAPER } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function AiCoachCard() {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl",
        "border border-ink/8 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]",
      )}
    >
      <div className="flex flex-1 flex-col p-5 pb-0">
        <header className="flex flex-wrap items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-cyan/12 text-cyan">
            <SparkleIcon className="size-4" />
          </span>
          <h2 className="font-display text-[17px] font-bold tracking-tight text-cyan">
            AI Coach
          </h2>
          <span className="ml-auto rounded-full border border-cyan/25 bg-cyan/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-teal">
            Coming in a few days
          </span>
        </header>

        <div className="mt-4 space-y-3">
          <p className="text-[14px] leading-[1.55] text-ink/80">
            Personalised listening tips, weak-area analysis, and what to
            practise next — powered by AI — are almost ready.
          </p>
          <p className="text-[12px] leading-snug text-ink/45">
            Keep completing mocks for now. Insights will appear here once AI
            Coach launches.
          </p>
        </div>

        <p
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-ink/15 bg-ink/[0.02] px-3 py-2 text-[12px] font-semibold text-ink/45"
          aria-disabled
        >
          View insights — available soon
        </p>
      </div>

      <div className="relative mt-4 max-h-32 shrink-0 overflow-hidden md:max-h-36">
        <LighthouseScene className="w-full opacity-60" />
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/80 via-white/20 to-transparent"
          aria-hidden
        />
      </div>
    </article>
  );
}

function LighthouseScene({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-b from-[#E0F7FA] via-[#B2EBF2]/40 to-[#E8F4F8]",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#81D4FA]/50 to-[#B3E5FC]/20" />
      <div
        className="absolute bottom-[32%] left-[54%] h-[55%] w-[70%] origin-bottom-left -skew-x-12 opacity-70"
        style={{
          background:
            "linear-gradient(105deg, rgba(255,253,231,0.85) 0%, rgba(255,253,231,0.25) 45%, transparent 72%)",
        }}
      />
      <svg
        viewBox="0 0 320 200"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <ellipse cx="160" cy="188" rx="120" ry="22" fill="#4DB6AC" fillOpacity="0.35" />
        <ellipse cx="155" cy="184" rx="80" ry="16" fill="#26A69A" fillOpacity="0.25" />
        <path
          d="M148 200 L148 95 L158 88 L172 88 L182 95 L182 200 Z"
          fill={INK}
        />
        <rect x="148" y="118" width="34" height="14" fill={PAPER} />
        <rect x="148" y="148" width="34" height="12" fill={PAPER} />
        <rect x="144" y="78" width="42" height="18" rx="2" fill={PAPER} />
        <rect x="146" y="80" width="38" height="14" rx="1" fill="#FDE68A" opacity="0.9" />
        <path d="M165 78 L165 68 L148 78 Z" fill={INK} />
        <path d="M165 78 L165 68 L182 78 Z" fill="#1E293B" />
        <circle cx="165" cy="87" r="8" fill="#FEF9C3" opacity="0.95" />
        <circle cx="165" cy="87" r="14" fill="#FEF9C3" opacity="0.35" />
        <rect x="158" y="172" width="14" height="18" rx="2" fill="#1E293B" />
        <ellipse cx="120" cy="192" rx="18" ry="6" fill="#90A4AE" opacity="0.4" />
        <ellipse cx="210" cy="194" rx="22" ry="7" fill="#90A4AE" opacity="0.35" />
      </svg>
      <svg
        className="absolute bottom-0 left-0 right-0 h-[22%] w-full opacity-50"
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 24 Q50 16 100 24 T200 24 T300 24 T400 24 V40 H0 Z"
          fill="#4DD0E1"
          fillOpacity="0.25"
        />
        <path
          d="M0 30 Q60 22 120 30 T240 30 T360 30 V40 H0 Z"
          fill="#26C6DA"
          fillOpacity="0.2"
        />
      </svg>
    </div>
  );
}
