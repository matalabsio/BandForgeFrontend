import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TestShellProps = {
  children: ReactNode;
  /** Top bar: timer (top-right), minimal chrome — no marketing */
  header?: ReactNode;
  className?: string;
};

/**
 * Wrapper for active test screens — white background, no branding (4.3).
 */
export function TestShell({ children, header, className }: TestShellProps) {
  return (
    <div className={cn("test-interface flex min-h-dvh flex-col", className)}>
      {header}
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
