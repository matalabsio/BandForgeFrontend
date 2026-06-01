import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({
  className,
  children,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#0F172A]/8 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function DashboardCardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-[#0F172A]/6 px-5 py-4">
      <div>
        <h2 className="text-[15px] font-bold text-[#0F172A]">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-[#0F172A]/45">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
