import { Info } from "lucide-react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function SectionInfoNotice({ children, className = "" }: Props) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-[13px] border border-border bg-[rgb(13_31_60/0.04)] px-3.5 py-3 sm:gap-2.5 sm:px-4 ${className}`}
    >
      <Info className="mt-0.5 size-[15px] shrink-0 text-[#7689A0]" strokeWidth={2} aria-hidden />
      <p className="text-[12.5px] font-light leading-relaxed text-muted sm:text-[13px]">
        {children}
      </p>
    </div>
  );
}
