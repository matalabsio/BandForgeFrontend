"use client";

import { parsePassageBlocks } from "@/modules/reading/lib/passage-format";

type Props = {
  passageText: string;
};

export function ReadingPassagePanel({ passageText }: Props) {
  const blocks = parsePassageBlocks(passageText);

  return (
    <div className="reading-passage-scroll h-full max-h-full overflow-y-auto overscroll-contain bg-[var(--reading-paper)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-prose">
        {blocks.length > 0 ? (
          <div className="space-y-6">
            {blocks.map((block, i) => {
              if (block.kind === "title") {
                return (
                  <h2
                    key={`t-${i}`}
                    className="font-display text-center text-lg font-bold leading-snug text-[var(--reading-ink)] sm:text-xl"
                  >
                    {block.text}
                  </h2>
                );
              }
              return (
                <div key={`p-${block.label}-${i}`} className="flex gap-3 sm:gap-4">
                  {block.label ? (
                    <span
                      className="mt-0.5 shrink-0 font-display text-base font-bold text-[var(--reading-ink)]"
                      aria-hidden
                    >
                      {block.label}
                    </span>
                  ) : null}
                  <p className="text-[15px] leading-[1.75] text-[var(--reading-ink)]/90">
                    {block.text}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[15px] leading-[1.75] text-[var(--reading-ink)]/90">
            {passageText}
          </p>
        )}
      </div>
    </div>
  );
}
