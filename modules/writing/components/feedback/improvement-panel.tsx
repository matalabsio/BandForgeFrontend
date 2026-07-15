import { Lightbulb } from "lucide-react";

type Props = {
  items: string[];
};

export function ImprovementPanel({ items }: Props) {
  return (
    <div className="rounded-xl border border-[#FDE68A] border-l-4 border-l-[#F59E0B] bg-[#FFFBEB] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706]">
          <Lightbulb className="size-4" aria-hidden />
        </span>
        <h3 className="text-[14px] font-bold text-ink">To Improve</h3>
      </div>
      <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#334155]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              className="mt-2 size-1 shrink-0 rounded-full bg-[#F59E0B]"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
