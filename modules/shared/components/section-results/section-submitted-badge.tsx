import { Check, Clock } from "lucide-react";

type Variant = "submitted" | "time-expired" | "all-correct";

const COPY: Record<Variant, { label: string; icon: "check" | "clock"; className: string }> = {
  submitted: {
    label: "Section submitted",
    icon: "check",
    className: "text-[#5E84A8]",
  },
  "time-expired": {
    label: "Time expired",
    icon: "clock",
    className: "text-muted",
  },
  "all-correct": {
    label: "Section submitted",
    icon: "check",
    className: "text-[#5E84A8]",
  },
};

type Props = {
  variant?: Variant;
  className?: string;
};

export function SectionSubmittedBadge({
  variant = "submitted",
  className = "",
}: Props) {
  const cfg = COPY[variant];
  const Icon = cfg.icon === "check" ? Check : Clock;

  return (
    <div
      className={`mb-5 flex items-center gap-2 sm:mb-6 ${cfg.className} ${className}`.trim()}
    >
      <Icon
        className={`size-[17px] shrink-0 ${variant === "time-expired" ? "text-muted" : "text-emerald-500"}`}
        strokeWidth={variant === "time-expired" ? 2 : 2.3}
        aria-hidden
      />
      <span className="font-mono text-[11.5px] font-medium uppercase tracking-[0.1em]">
        {cfg.label}
      </span>
    </div>
  );
}

export function SectionSuccessBanner({ message }: { message: string }) {
  return (
    <div className="mb-5 flex items-center gap-2.5 rounded-[13px] border border-emerald-200/80 bg-emerald-50 px-3.5 py-3">
      <Check className="size-4 shrink-0 text-emerald-600" strokeWidth={2.5} aria-hidden />
      <p className="text-[13.5px] font-medium leading-snug text-emerald-800">{message}</p>
    </div>
  );
}
