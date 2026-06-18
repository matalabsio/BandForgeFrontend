import { cn } from "@/lib/utils";

type Step = {
  n: number;
  title: string;
  body?: string;
};

type Props = {
  steps: readonly Step[];
  className?: string;
};

/** Mobile marketing landing — vertical timeline with left rail. */
export function BfMarketingStepTimeline({ steps, className }: Props) {
  return (
    <ol className={cn("lg:hidden", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.n}
            className={cn(
              "relative ml-1.5 border-l-2 pl-5",
              isLast
                ? "border-transparent"
                : "border-border-muted pb-[22px]",
            )}
          >
            <span
              className={cn(
                "absolute top-0 -left-[13px] flex size-6 items-center justify-center rounded-full font-mono text-[0.6875rem] font-medium",
                isLast
                  ? "bg-cyan text-white"
                  : "border-2 border-cyan bg-white text-cyan",
              )}
            >
              {step.n}
            </span>
            <p className="font-display text-base font-semibold text-navy">
              {step.title}
            </p>
            {step.body ? (
              <p className="mt-0.5 text-sm leading-normal text-muted">
                {step.body}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
