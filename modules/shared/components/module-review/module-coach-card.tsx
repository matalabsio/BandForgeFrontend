import { GraduationCap } from "lucide-react";

type Props = {
  title: string;
  message: string;
};

export function ModuleCoachCard({ title, message }: Props) {
  return (
    <section className="flex gap-3.5 rounded-2xl border border-[#E3E9F1] bg-white p-4 shadow-[0_12px_40px_rgba(13,31,60,0.06)] sm:gap-4 sm:p-5">
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-cyan text-white sm:size-12"
        aria-hidden
      >
        <GraduationCap className="size-5 sm:size-6" strokeWidth={2.1} />
      </div>
      <div className="min-w-0">
        <h2 className="font-display text-[15px] font-bold tracking-tight text-navy sm:text-base">
          {title}
        </h2>
        <p className="mt-1 font-sans text-[13.5px] leading-relaxed font-light text-[#475569] sm:text-sm">
          {message}
        </p>
      </div>
    </section>
  );
}
