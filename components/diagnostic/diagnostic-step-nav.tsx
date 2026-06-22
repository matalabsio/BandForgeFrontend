import { Headphones, BookOpen, Pencil, Mic, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagnosticModule } from "@/lib/diagnostic-storage";

const STEPS: {
  id: DiagnosticModule;
  label: string;
  short: string;
  Icon: typeof Headphones;
}[] = [
  { id: "listening", label: "Listening", short: "L", Icon: Headphones },
  { id: "reading", label: "Reading", short: "R", Icon: BookOpen },
  { id: "writing", label: "Writing", short: "W", Icon: Pencil },
  { id: "speaking", label: "Speaking", short: "S", Icon: Mic },
];

type Props = {
  current: DiagnosticModule;
  className?: string;
};

/** Section progress: Listening → Reading → Writing → Speaking */
export function DiagnosticStepNav({ current, className }: Props) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <nav
      className={cn("w-full", className)}
      aria-label="Diagnostic sections"
    >
      <ol className="flex items-center justify-center gap-0 sm:justify-start">
        {STEPS.map((step, idx) => {
          const isCurrent = step.id === current;
          const isComplete = idx < currentIdx;
          const isUpcoming = idx > currentIdx;
          const Icon = step.Icon;

          return (
            <li key={step.id} className="flex items-center">
              {idx > 0 ? (
                <ChevronRight
                  className="mx-0.5 h-4 w-4 shrink-0 text-border-muted sm:mx-1"
                  aria-hidden
                />
              ) : null}
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-1.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5",
                  isCurrent && "bg-cyan/10 ring-1 ring-cyan/25",
                  isComplete && "text-navy",
                  isUpcoming && "text-muted-light",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                    isCurrent && "bg-cyan text-white",
                    isComplete && "bg-teal/15 text-teal",
                    isUpcoming && "bg-surface text-muted-light",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  )}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-semibold sm:inline",
                    isCurrent && "text-cyan",
                    isComplete && "text-navy",
                    isUpcoming && "text-muted-light",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
