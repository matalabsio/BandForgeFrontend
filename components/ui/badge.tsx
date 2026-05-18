import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "teal" | "success" | "warning" | "danger" | "navy";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  teal: "bg-teal-light/20 text-teal",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  navy: "bg-navy/10 text-navy",
};

export function Badge({
  variant = "teal",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-meta font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
