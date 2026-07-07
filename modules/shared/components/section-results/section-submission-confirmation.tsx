import { Check } from "lucide-react";
import { SectionInfoNotice } from "./section-info-notice";
import { SectionStatCards } from "./section-stat-cards";

type Props = {
  title?: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  infoMessage: string;
};

export function SectionSubmissionConfirmation({
  title = "Your response has been recorded",
  subtitle,
  stats,
  infoMessage,
}: Props) {
  return (
    <div className="flex w-full max-w-lg flex-col items-center text-center">
      <div className="mb-6 flex size-[72px] items-center justify-center rounded-full bg-cyan/15 sm:mb-7 sm:size-[88px]">
        <Check className="size-[34px] text-teal sm:size-[42px]" strokeWidth={2.3} aria-hidden />
      </div>

      <h2 className="font-display text-[22px] font-bold tracking-tight text-navy sm:text-[28px] lg:text-[32px]">
        {title}
      </h2>
      <p className="mt-2 text-sm font-light text-muted sm:mt-2.5 sm:text-base">{subtitle}</p>

      <div className="mt-7 w-full sm:mt-8">
        <SectionStatCards stats={stats} />
      </div>

      <div className="mt-6 w-full sm:mt-7">
        <SectionInfoNotice>{infoMessage}</SectionInfoNotice>
      </div>
    </div>
  );
}
