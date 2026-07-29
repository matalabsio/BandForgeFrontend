import type { StudyPlanWeek } from "@/lib/diagnostic-plan-content";

type Props = {
  weeks?: StudyPlanWeek[];
  /** Generic unreadable bars — used under the paywall blur. */
  placeholder?: boolean;
};

const PLACEHOLDER_CHIPS = ["Week 1", "Week 2", "Week 3", "Week 4"];
const PLACEHOLDER_BLOCKS = [
  { title: "Phase one", lines: 2 },
  { title: "Phase two", lines: 2 },
  { title: "Phase three", lines: 2 },
];

/**
 * Plan teaser: real weeks when unlocked, fake silhouette bars when locked.
 */
export function DiagnosticPlanTeaserContent({
  weeks = [],
  placeholder = false,
}: Props) {
  if (placeholder) {
    return (
      <div className="space-y-3 sm:space-y-3.5" aria-hidden>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {PLACEHOLDER_CHIPS.map((chip) => (
            <div
              key={chip}
              className="rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] px-2.5 py-2.5 sm:px-3"
            >
              <div className="mx-auto h-3 w-14 rounded bg-[#D5DCE6]" />
            </div>
          ))}
        </div>

        {PLACEHOLDER_BLOCKS.map((block) => (
          <div
            key={block.title}
            className="rounded-[10px] border border-[#E4E7EC] bg-[#F7F8FA] p-3.5 sm:p-4"
          >
            <div className="mb-2.5 h-3.5 w-28 rounded bg-[#C5CDD8]" />
            {Array.from({ length: block.lines }).map((_, i) => (
              <div
                key={i}
                className="mb-1.5 h-2.5 max-w-full rounded bg-[#D5DCE6]"
                style={{ width: `${88 - i * 18}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-3.5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {weeks.map((week) => (
          <div
            key={week.title}
            className="rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] px-2.5 py-2 text-center text-[12px] font-semibold text-[#0B1B33] sm:px-3 sm:py-2.5 sm:text-[13px]"
          >
            {week.title.replace(" · ", "–").replace("Week ", "Week ")}
          </div>
        ))}
      </div>

      {weeks.map((week) => (
        <div
          key={`${week.title}-block`}
          className="rounded-[10px] border border-[#E4E7EC] bg-[#F7F8FA] p-3.5 sm:p-4"
        >
          <p className="mb-1.5 text-[13px] font-bold text-[#0B1B33] sm:text-sm">
            {week.title}
          </p>
          {week.items.slice(0, 2).map((item) => (
            <p
              key={item}
              className="text-[12px] leading-relaxed text-[#4B5568] sm:text-[13px]"
            >
              {item}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
