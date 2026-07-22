import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const ctaClass =
  "inline-flex min-h-10 min-w-[6.5rem] cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan font-display font-semibold text-white no-underline transition-colors hover:bg-brand-sky-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 px-4 py-2 text-[0.8125rem] lg:px-[22px] lg:py-2.5 lg:text-[0.9375rem]";

export function BfHeaderAuthCta({ compact }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" prefetch className={cn(ctaClass, compact && "px-4 text-sm")}>
      <LayoutDashboard className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
      Dashboard
    </Link>
  );
}
