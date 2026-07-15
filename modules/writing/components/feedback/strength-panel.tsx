import { Check } from "lucide-react";

type Props = {
  items: string[];
};

export function StrengthPanel({ items }: Props) {
  return (
    <div className="rounded-xl border border-[#BBF7D0] border-l-4 border-l-[#22C55E] bg-[#F0FDF4] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
          <Check className="size-4" aria-hidden />
        </span>
        <h3 className="text-[14px] font-bold text-ink">Strengths</h3>
      </div>
      <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#334155]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              className="mt-2 size-1 shrink-0 rounded-full bg-[#22C55E]"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
