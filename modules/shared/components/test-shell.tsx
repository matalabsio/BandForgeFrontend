import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TestShellProps = {
  children: ReactNode;
  /** Top bar: timer (top-right), minimal chrome — no marketing */
  header?: ReactNode;
  className?: string;
  /**
   * Lock the shell to the viewport and let children own scrolling.
   * Use for live exam flows (speaking/writing) with a pinned footer.
   */
  fillViewport?: boolean;
};

/**
 * Wrapper for active test screens — white background, no branding (4.3).
 */
export function TestShell({
  children,
  header,
  className,
  fillViewport = false,
}: TestShellProps) {
  return (
    <div
      className={cn(
        "test-interface flex flex-col",
        fillViewport
          ? "h-dvh max-h-dvh overflow-hidden"
          : "min-h-dvh",
        className,
      )}
    >
      {header}
      <div
        className={cn(
          "flex flex-1 flex-col",
          fillViewport ? "min-h-0 overflow-hidden" : "min-h-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
