import { cn } from "@/lib/utils";
import type { WritingTaskOptions } from "@/modules/writing/types";

type Props = {
  part: 1 | 2;
  options?: WritingTaskOptions | null;
  minutes: number;
  minWords: number;
  className?: string;
  /** Hide IELTS Academic pill (plan practice). */
  plainHeader?: boolean;
};

export function WritingTaskPromptHeader({
  part,
  options,
  minutes,
  minWords,
  className,
  plainHeader = false,
}: Props) {
  const title = options?.title ?? `Writing Task ${part}`;
  const difficulty = options?.difficulty;

  return (
    <header className={cn("space-y-3 border-b border-[#E2E8F0] pb-4", className)}>
      {plainHeader ? null : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#ECFEFF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-teal">
            IELTS Academic · Task {part}
          </span>
          {difficulty ? (
            <span
              className="rounded-full border border-[#E2E8F0] bg-surface px-2.5 py-0.5 text-[10px] font-semibold text-[#475569]"
              title="Target difficulty"
            >
              {difficulty}
            </span>
          ) : null}
        </div>
      )}
      <h2 className="font-display text-[17px] font-bold leading-snug text-ink md:text-lg">
        {title}
      </h2>
      <p className="text-[12px] font-medium text-[#64748B]">
        {minutes} minutes · at least {minWords} words
      </p>
    </header>
  );
}
