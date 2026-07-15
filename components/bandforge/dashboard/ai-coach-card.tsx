import Link from "next/link";
import { SparkleIcon } from "@/components/bandforge/dashboard/icons";
import { cn } from "@/lib/utils";

type Props = {
  coachHref?: string | null;
  teaserLines?: string[];
};

export function AiCoachCard({ coachHref = null, teaserLines = [] }: Props) {
  const href = coachHref || "/study-plan";
  const isWritingCoach = Boolean(coachHref);

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
            Live
          </span>
        </header>

        <div className="mt-4 space-y-3">
          <p className="text-[14px] leading-[1.55] text-ink/80">
            {isWritingCoach
              ? "Ask why you scored this band, rewrite a paragraph, or get a Band 8 version — grounded in your essay and evaluation."
              : "Conversational tutoring lives on your writing feedback. Complete a writing task to unlock coach chat on that essay."}
          </p>
          {teaserLines.length > 0 ? (
            <ul className="space-y-1.5">
              {teaserLines.slice(0, 2).map((line) => (
                <li
                  key={line}
                  className="rounded-lg border border-ink/8 bg-ink/[0.02] px-3 py-2 text-[12px] text-ink/70"
                >
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] leading-snug text-ink/45">
              Coach uses your score report, grammar notes, and learning profile —
              not generic IELTS tips.
            </p>
          )}
        </div>

        <Link
          href={href}
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/8 px-3 py-2 text-[12px] font-semibold text-teal transition hover:bg-cyan/15"
        >
          {isWritingCoach ? "Open writing coach" : "View study plan"}
        </Link>
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
    >
      <svg viewBox="0 0 320 200" className="size-full" aria-hidden>
        <ellipse cx="160" cy="170" rx="140" ry="24" fill="#4DD0E1" opacity="0.35" />
        <rect x="148" y="70" width="24" height="80" rx="3" fill="#0D9488" />
        <polygon points="160,40 140,70 180,70" fill="#14B8A6" />
        <circle cx="160" cy="55" r="8" fill="#FBBF24" opacity="0.9" />
      </svg>
    </div>
  );
}
