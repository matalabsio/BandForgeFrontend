import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { bfPrimaryCtaNavClass } from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

export function BfHeaderAuthCta({ compact }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      prefetch
      className={cn(
        bfPrimaryCtaNavClass,
        "gap-2",
        compact && "min-w-0 px-4 py-2 text-sm",
      )}
    >
      <LayoutDashboard
        className="relative z-[1] size-4 shrink-0"
        strokeWidth={2.25}
        aria-hidden
      />
      <span className="relative z-[1]">Dashboard</span>
    </Link>
  );
}
