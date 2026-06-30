import { LineChart } from "lucide-react";

type Props = {
  narrative: string;
  reachBand: string;
};

export function DiagnosticScoreAnalysisBlock({ narrative, reachBand }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-[#0D1F3C] p-6 shadow-[0_18px_44px_rgba(13,31,60,0.28)] sm:flex-row sm:items-start sm:gap-[22px] sm:p-7 sm:px-8">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,188,212,0.16)]">
        <LineChart className="size-[22px] text-cyan" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold tracking-tight text-white">
          What&apos;s holding your score back
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed font-light text-[#C6D2E4]">
          {narrative.split(reachBand).map((part, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>
                {part}
                <span className="font-medium text-cyan">{reachBand}</span>
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </p>
      </div>
    </div>
  );
}
