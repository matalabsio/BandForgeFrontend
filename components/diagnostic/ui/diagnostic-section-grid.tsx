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
    <div className="grid grid-cols-2 gap-2.5 sm:gap-[11px]">
      {SECTIONS.map(({ label, duration, Icon }) => (
        <div
          key={label}
          className="rounded-2xl border border-[#E6EBF1] bg-white p-4 shadow-[0_4px_12px_rgba(13,31,60,0.04)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-[11px] bg-[#E6F6F8]">
              <Icon className="size-5 text-teal" strokeWidth={2} />
            </div>
            <span className="font-mono text-xs text-[#94A3B8]">{duration}</span>
          </div>
          <div className="font-display text-base font-bold text-navy">{label}</div>
        </div>
      ))}
    </div>
  );
}
