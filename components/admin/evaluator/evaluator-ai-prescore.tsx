"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  evaluatorCard,
  evaluatorCardPad,
  evaluatorMeta,
  evaluatorTitle,
} from "@/components/admin/evaluator/evaluator-ui";
import {
  computeOverallBand,
  CRITERIA_KEYS,
  CRITERIA_LABELS,
} from "@/lib/speaking-band";
import { cn } from "@/lib/utils";

type Props = {
  aiScores: Record<string, unknown> | null;
};

function barWidth(band: number) {
  return `${Math.min(100, Math.max(0, (band / 9) * 100))}%`;
}

export function EvaluatorAiPrescore({ aiScores }: Props) {
  const [shown, setShown] = useState(true);

  const criteria = CRITERIA_KEYS.map((key) => ({
    key,
    label: CRITERIA_LABELS[key],
    value:
      aiScores?.[key] != null ? Number(aiScores[key]) : null,
  }));

  const overall = computeOverallBand(
    Object.fromEntries(
      criteria
        .filter((c) => c.value != null)
        .map((c) => [c.key, c.value as number]),
    ) as Record<string, number>,
  );

  const hasData = criteria.some((c) => c.value != null);

  return (
    <section className={cn(evaluatorCard, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-[#F1F4F8] px-[18px] py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-[30px] items-center justify-center rounded-lg bg-[#EEF6FF] text-[#1E63B8]">
            <Sparkles className="size-4" />
          </span>
          <h3 className={evaluatorTitle}>AI Pre-Score</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] text-[#94A3B8]">Shown</span>
          <button
            type="button"
            role="switch"
            aria-checked={shown}
            onClick={() => setShown((v) => !v)}
            className={cn(
              "relative h-5 w-[34px] cursor-pointer rounded-full transition-colors",
              shown ? "bg-cyan" : "bg-[#E4E9F0]",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all",
                shown ? "left-4" : "left-0.5",
              )}
            />
          </button>
        </div>
      </div>

      <div className={cn(evaluatorCardPad, !shown && "opacity-40")}>
        {!hasData ? (
          <p className="text-sm font-light text-[#5A6B82]">
            No AI scores available.
          </p>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3.5">
              <p className="font-mono text-[2.375rem] font-medium leading-[0.85] text-[#1E63B8]">
                {overall != null ? overall.toFixed(1) : "—"}
              </p>
              <p className="text-[12.5px] font-light leading-snug text-[#5A6B82]">
                Estimated overall from acoustic &amp; transcript analysis
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {criteria.map(({ key, label, value }) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-[12.5px]">
                    <span className="text-[#5A6B82]">{label}</span>
                    <span className="font-mono font-medium text-navy">
                      {value != null ? value.toFixed(1) : "—"}
                    </span>
                  </div>
                  <div className="h-[5px] overflow-hidden rounded-sm bg-[#EEF2F7]">
                    <div
                      className="h-full rounded-sm bg-[#1E63B8] transition-all duration-300"
                      style={{
                        width: value != null ? barWidth(value) : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
