import type { LucideIcon } from "lucide-react";
import { BfMarketingWordmark } from "@/components/bandforge/bf-marketing-wordmark";

type Props = {
  label: string;
  Icon: LucideIcon;
  timer?: React.ReactNode;
};

export function DiagnosticExamTopBar({ label, Icon, timer }: Props) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-navy/8 px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <BfMarketingWordmark href="/diagnostic" className="shrink-0" />
        <div className="hidden h-[18px] w-px bg-navy/12 sm:block" aria-hidden />
        <Icon className="hidden size-[18px] shrink-0 text-cyan sm:block" aria-hidden />
        <span className="truncate font-display text-base font-semibold text-navy">
          {label}
        </span>
      </div>
      {timer}
    </div>
  );
}
