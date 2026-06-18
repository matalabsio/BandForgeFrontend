import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/bandforge/dashboard/icons";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
};

export function BfSettingsRow({
  label,
  value,
  href,
  onClick,
  className,
  icon,
}: Props) {
  const inner = (
    <>
      <span className="flex items-center gap-3">
        {icon}
        <span className="text-[0.9375rem] font-medium text-navy">{label}</span>
      </span>
      <span className="flex items-center gap-2 text-sm text-muted-light">
        {value ? <span>{value}</span> : null}
        <ChevronDownIcon className="size-4 -rotate-90 text-muted-light" />
      </span>
    </>
  );

  const rowClass = cn(
    "flex min-h-[var(--spacing-touch)] cursor-pointer items-center justify-between border-b border-border-soft px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-alt",
    className,
  );

  if (href) {
    return (
      <Link href={href} prefetch className={rowClass}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(rowClass, "w-full text-left")}>
      {inner}
    </button>
  );
}
