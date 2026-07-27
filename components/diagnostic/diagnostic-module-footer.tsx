"use client";

import { ArrowRight } from "lucide-react";
import { bfPrimaryCtaDiagClass } from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  busy?: boolean;
  busyLabel?: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  contentWidth?: "narrow" | "full";
};

/** Pinned footer — narrow mode aligns to 760px diagnostic content column. */
export function DiagnosticModuleFooter({
  label,
  busy = false,
  busyLabel = "Saving…",
  disabled = false,
  onClick,
  className,
  contentWidth = "narrow",
}: Props) {
  const narrow = contentWidth === "narrow";

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border-soft bg-white/95 shadow-[0_-4px_24px_rgb(15_25_35/0.06)] backdrop-blur-md",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full px-4 sm:px-6",
          narrow ? "max-w-[760px]" : "max-w-6xl",
        )}
      >
        <button
          type="button"
          disabled={disabled || busy}
          onClick={onClick}
          className={cn(
            bfPrimaryCtaDiagClass,
            !narrow && "sm:ml-auto sm:max-w-sm",
          )}
        >
          <span className="relative z-[1]">{busy ? busyLabel : label}</span>
          {!busy ? (
            <ArrowRight className="relative z-[1] h-4 w-4 shrink-0" aria-hidden />
          ) : null}
        </button>
      </div>
    </div>
  );
}
