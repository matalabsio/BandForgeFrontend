"use client";

import { ReadingPassagePanel } from "@/modules/reading/components/reading-passage-panel";
import { bfPrimaryCtaExamFooterClass } from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

type Props = {
  passageText: string;
  onContinue: () => void;
};

export function ReadingPassagePhase({ passageText, onContinue }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <div className="flex min-h-[34vh] max-h-[46vh] min-w-0 flex-1 flex-col overflow-hidden border-b border-[var(--reading-border)] sm:min-h-[40vh] lg:max-h-[calc(100dvh-3rem)] lg:min-h-0 lg:w-[min(56%,1fr)] lg:border-b-0 lg:border-r">
        <ReadingPassagePanel passageText={passageText} />
      </div>
      <aside className="shrink-0 border-t border-[var(--reading-border)] bg-white px-4 py-4 sm:px-6 lg:min-h-0 lg:w-[min(44%,520px)] lg:border-l lg:border-t-0">
        <div className="mx-auto flex h-full max-w-lg flex-col justify-center">
          <div className="rounded-lg border border-[var(--reading-border)] bg-[var(--reading-surface)] px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--reading-accent)]">
              Passage Review
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--reading-ink-muted)]">
              Read the passage carefully. You will not be able to view it again after
              you continue.
            </p>
            <button
              type="button"
              onClick={onContinue}
              className={cn(bfPrimaryCtaExamFooterClass, "mt-4")}
            >
              Continue to Questions 1–5
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
