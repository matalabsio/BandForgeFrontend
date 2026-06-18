import { cn } from "@/lib/utils";

type Step = {
  n: number;
  title: string;
  body?: string;
};

type Props = {
  steps: readonly Step[];
  layout?: "horizontal" | "vertical";
  activeStep?: number;
  className?: string;
};

export function BfStepIndicator({
  steps,
  layout = "horizontal",
  activeStep,
  className,
}: Props) {
  if (layout === "vertical") {
    return (
      <ol className={cn("flex flex-col gap-5", className)}>
        {steps.map((step) => {
          const active = activeStep === step.n;
          const done = activeStep !== undefined && step.n < activeStep;
          return (
            <li key={step.n} className="flex items-center gap-3.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[0.8125rem]",
                  active
                    ? "bg-cyan text-white"
                    : done
                      ? "bg-cyan/20 text-cyan"
                      : "border border-white/30 text-slate",
                )}
              >
                {step.n}
              </span>
              <span
                className={cn(
                  "text-[0.9375rem] font-medium",
                  active ? "text-white" : "text-slate",
                )}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute top-[18px] right-[8%] left-[8%] hidden h-0.5 bg-border-muted lg:block"
        aria-hidden
      />
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
        {steps.map((step) => {
          const isLast = step.n === steps.length;
          return (
            <li key={step.n} className="relative z-10 text-center">
              <span
                className={cn(
                  "mx-auto mb-4 flex size-[38px] items-center justify-center rounded-full font-mono text-sm",
                  isLast
                    ? "bg-cyan text-white"
                    : "border-2 border-cyan bg-white text-cyan",
                )}
              >
                {step.n}
              </span>
              <p className="font-display text-[1.0625rem] font-semibold text-navy">
                {step.title}
              </p>
              {step.body ? (
                <p className="mt-1.5 text-[0.84375rem] leading-normal text-muted">
                  {step.body}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
