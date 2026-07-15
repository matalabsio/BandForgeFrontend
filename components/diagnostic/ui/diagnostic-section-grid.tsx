import {
  Headphones,
  BookOpen,
  Pencil,
  Mic,
  type LucideIcon,
} from "lucide-react";

const SECTIONS: {
  label: string;
  duration: string;
  Icon: LucideIcon;
}[] = [
  { label: "Listening", duration: "20 min", Icon: Headphones },
  { label: "Reading", duration: "25 min", Icon: BookOpen },
  { label: "Writing", duration: "25 min", Icon: Pencil },
  { label: "Speaking", duration: "7 min", Icon: Mic },
];

export function DiagnosticSectionGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
      {SECTIONS.map(({ label, duration, Icon }) => (
        <div
          key={label}
          className="flex items-center gap-3.5 rounded-2xl border border-[#E6EBF1] bg-white p-4 shadow-[0_4px_12px_rgba(13,31,60,0.04)] sm:gap-3"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#E6F6F8] sm:size-11">
            <Icon className="size-5 text-teal sm:size-[22px]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-bold text-navy">{label}</div>
            <div className="mt-0.5 font-mono text-xs text-[#94A3B8]">{duration}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
