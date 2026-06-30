import Link from "next/link";
import { Check } from "lucide-react";
import { BfMarketingWordmark } from "@/components/bandforge/bf-marketing-wordmark";
import { DiagnosticExamViewport } from "@/components/diagnostic/diagnostic-exam-viewport";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { cn } from "@/lib/utils";

type Variant = "marketing" | "exam" | "report";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  /** @deprecated use variant="report" */
  step?: "start" | "results";
  fillViewport?: boolean;
};

export function DiagnosticChrome({
  children,
  variant,
  step,
  fillViewport = false,
}: Props) {
  const resolved: Variant =
    variant ?? (step === "results" ? "report" : "marketing");

  if (resolved === "exam") {
    return <DiagnosticExamViewport>{children}</DiagnosticExamViewport>;
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        fillViewport ? "h-dvh overflow-hidden" : "min-h-dvh",
        resolved === "marketing" ? "bg-[#F5F7FA]" : "bg-[#F8FAFC]",
      )}
    >
      <header
        className={cn(
          "shrink-0",
          resolved === "marketing"
            ? "px-4 py-5 sm:px-6"
            : "border-b border-navy/8 bg-white/95 backdrop-blur-md",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between gap-3",
            resolved === "report" ? "max-w-3xl px-4 py-3 sm:px-6" : "max-w-6xl",
          )}
        >
          <BfMarketingWordmark href="/" />
          {resolved === "report" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9F0DC] bg-[#ECFBF3] px-2.5 py-1 text-[11px] font-semibold text-[#0E8F5B] sm:px-3.5 sm:py-1.5 sm:text-[13px]">
              <Check className="size-3 text-[#10B981] sm:size-3.5" strokeWidth={2.6} />
              <span className="sm:hidden">Complete</span>
              <span className="hidden sm:inline">Diagnostic complete</span>
            </span>
          ) : resolved === "marketing" ? null : (
            <nav
              className="flex items-center gap-2 text-xs font-medium text-muted sm:text-sm"
              aria-label="Diagnostic progress"
            >
              <Link
                href={diagnosticPaths.landing}
                className="cursor-pointer transition-colors hover:text-navy"
              >
                Diagnostic
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className={cn("flex flex-1 flex-col", fillViewport && "min-h-0")}>
        {children}
      </main>
    </div>
  );
}
