import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminCard } from "@/components/admin/admin-ui";

type AdminKpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  Icon: LucideIcon;
  accent?: "teal" | "emerald" | "amber" | "violet";
  href?: string;
  trendPct?: number | null;
  className?: string;
};

const accentStyles = {
  teal: { icon: "bg-cyan-soft text-teal", ring: "hover:border-cyan/40" },
  emerald: { icon: "bg-emerald-100 text-emerald-700", ring: "hover:border-emerald-300" },
  amber: { icon: "bg-amber-100 text-amber-700", ring: "hover:border-amber-300" },
  violet: { icon: "bg-violet-100 text-violet-700", ring: "hover:border-violet-300" },
} as const;

function TrendBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        up ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700",
      )}
    >
      {up ? <TrendingUp className="size-3" aria-hidden /> : <TrendingDown className="size-3" aria-hidden />}
      {up ? "+" : ""}
      {pct}%
    </span>
  );
}

export function AdminKpiCard({
  label,
  value,
  hint,
  Icon,
  accent = "teal",
  href,
  trendPct,
  className,
}: AdminKpiCardProps) {
  const styles = accentStyles[accent];

  const inner = (
    <div className="flex h-full min-h-[7.5rem] flex-col justify-between gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", styles.icon)}>
            <Icon className="size-4" aria-hidden />
          </div>
          <p className="text-xs font-semibold leading-snug text-black">{label}</p>
        </div>
        {trendPct != null ? <TrendBadge pct={trendPct} /> : null}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums tracking-tight text-black sm:text-[1.75rem]">
          {value}
        </p>
        {hint ? <p className="mt-0.5 text-[11px] font-medium text-gray-600">{hint}</p> : null}
      </div>
    </div>
  );

  const cardClass = cn(
    adminCard,
    "p-4 transition-all duration-200",
    href && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
    href && styles.ring,
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}
