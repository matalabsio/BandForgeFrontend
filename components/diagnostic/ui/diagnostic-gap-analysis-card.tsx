import { Target } from "lucide-react";

type Props = {
  currentBand: number;
  targetBand: number;
  goalLabel: string;
  impactArea: string;
};

export function DiagnosticGapAnalysisCard({
  currentBand,
  targetBand,
  goalLabel,
  impactArea,
}: Props) {
  const gap = Math.max(0, targetBand - currentBand);
  const progressPct = Math.min(100, Math.max(8, (currentBand / 9) * 100));
  const targetPct = Math.min(100, (targetBand / 9) * 100);

  return (
    <div className="rounded-[18px] border-[1.5px] border-cyan/45 bg-cyan/[0.07] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Target className="size-4 text-cyan" aria-hidden />
        <span className="font-mono text-[10.5px] tracking-[0.12em] text-teal uppercase">
          Gap analysis
        </span>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-[#5A6B82]">
        <span>
          Current{" "}
          <span className="font-mono text-navy">{currentBand.toFixed(1)}</span>
        </span>
        <span>
          Target{" "}
          <span className="font-mono text-teal">{targetBand.toFixed(1)}</span>
        </span>
      </div>

      <div className="relative mb-4 h-[7px] rounded bg-navy/10">
        <div
          className="absolute inset-y-0 left-0 rounded bg-cyan"
          style={{ width: `${progressPct}%` }}
        />
        <div
          className="absolute top-1/2 h-[15px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-navy"
          style={{ left: `${targetPct}%` }}
        />
      </div>

      <p className="text-sm leading-relaxed font-light text-[#1B2B45]">
        Target:{" "}
        <span className="font-semibold text-navy">
          Band {targetBand.toFixed(1)} for {goalLabel}
        </span>
        . Current gap:{" "}
        <span className="font-semibold text-navy">
          {gap.toFixed(1)} band{gap === 1 ? "" : "s"}
        </span>
        . Highest-impact area:{" "}
        <span className="font-semibold text-teal">{impactArea}</span>.
      </p>
    </div>
  );
}
