import { cn } from "@/lib/utils";
import type { WritingTaskOptions } from "@/modules/writing/types";

type Props = {
  part: 1 | 2;
  options?: WritingTaskOptions | null;
  minutes: number;
  minWords: number;
  className?: string;
};

export function WritingTaskPromptHeader({
  part,
  options,
  minutes,
  minWords,
  className,
}: Props) {
  const title = options?.title ?? `Writing Task ${part}`;
  const difficulty = options?.difficulty;

  return (
    <header className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal">
          IELTS Academic · Task {part}
        </span>
        {difficulty ? (
          <span
            className="rounded-full bg-navy/8 px-2.5 py-0.5 text-[10px] font-semibold text-navy"
            title="Target difficulty"
          >
            {difficulty}
          </span>
        ) : null}
      </div>
      <h2 className="font-display text-lg font-bold leading-snug text-navy md:text-xl">
        {title}
      </h2>
      <p className="text-meta text-ink/55">
        {minutes} minutes · at least {minWords} words
      </p>
    </header>
  );
}
