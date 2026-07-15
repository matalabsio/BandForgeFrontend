import type { WritingCriterionScore } from "@/modules/writing/types";

function bandDisplay(band: number): string {
  if (band <= 0) return "—";
  return band.toFixed(1);
}

type Props = {
  criteria: WritingCriterionScore[];
};

export function CriteriaGrid({ criteria }: Props) {
  return (
    <section
      className="grid grid-cols-2 gap-3 sm:gap-4"
      aria-label="Criterion scores"
    >
      {criteria.map((criterion) => (
        <div
          key={criterion.key}
          className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5 shadow-sm"
        >
          <p className="font-mono text-2xl font-medium tabular-nums text-cyan">
            {bandDisplay(criterion.band)}
          </p>
          <p className="mt-1 text-[11px] font-medium leading-snug text-[#64748B]">
            {criterion.label}
          </p>
        </div>
      ))}
    </section>
  );
}
