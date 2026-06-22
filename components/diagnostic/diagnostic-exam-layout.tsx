import { cn } from "@/lib/utils";

type PanelAccent = "listening" | "reading" | "writing";

const accentText: Record<PanelAccent, string> = {
  listening: "text-cyan",
  reading: "text-[var(--reading-accent)]",
  writing: "text-cyan",
};

type PanelHeaderProps = {
  eyebrow: string;
  title?: string;
  hint?: string;
  accent?: PanelAccent;
};

export function DiagnosticPanelHeader({
  eyebrow,
  title,
  hint,
  accent = "listening",
}: PanelHeaderProps) {
  return (
    <div className="shrink-0 border-b border-border-soft bg-white px-4 py-3 sm:px-5">
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-[0.2em]",
          accentText[accent],
        )}
      >
        {eyebrow}
      </p>
      {title ? (
        <h2 className="mt-1 font-display text-base font-bold text-navy sm:text-lg">
          {title}
        </h2>
      ) : null}
      {hint ? <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}

type PassageBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export function DiagnosticPassageBody({ children, className }: PassageBodyProps) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto bg-[var(--exam-paper,#fafbfc)] px-4 py-4 sm:px-5 sm:py-5",
        className,
      )}
    >
      <div className="prose prose-sm max-w-none text-sm leading-relaxed text-navy prose-p:my-3">
        {children}
      </div>
    </div>
  );
}

export type DiagnosticMobilePanel = "left" | "right";

type SplitPaneProps = {
  leftHeader: React.ReactNode;
  leftBody: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  mobilePanel?: DiagnosticMobilePanel;
  onMobilePanelChange?: (panel: DiagnosticMobilePanel) => void;
  leftTabLabel?: string;
  rightTabLabel?: string;
};

/** Two-column exam layout — equal width on lg+, mobile toggle optional. */
export function DiagnosticSplitPane({
  leftHeader,
  leftBody,
  right,
  className,
  mobilePanel = "right",
  onMobilePanelChange,
  leftTabLabel = "Passage",
  rightTabLabel = "Questions",
}: SplitPaneProps) {
  const showToggle = Boolean(onMobilePanelChange);

  return (
    <div
      className={cn(
        "mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden lg:flex-row lg:px-6",
        className,
      )}
    >
      {showToggle ? (
        <div className="shrink-0 border-b border-border-soft bg-white px-4 py-2 lg:hidden">
          <div
            className="flex rounded-xl border border-border-soft bg-surface p-0.5"
            role="tablist"
            aria-label="Reading panels"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mobilePanel === "left"}
              onClick={() => onMobilePanelChange?.("left")}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                mobilePanel === "left"
                  ? "bg-white text-navy shadow-sm"
                  : "text-muted",
              )}
            >
              {leftTabLabel}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobilePanel === "right"}
              onClick={() => onMobilePanelChange?.("right")}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                mobilePanel === "right"
                  ? "bg-white text-navy shadow-sm"
                  : "text-muted",
              )}
            >
              {rightTabLabel}
            </button>
          </div>
        </div>
      ) : null}

      <section
        className={cn(
          "flex min-h-0 flex-col overflow-hidden border-b border-border-soft bg-white lg:min-h-0 lg:w-1/2 lg:border-b-0 lg:border-r",
          showToggle && mobilePanel !== "left" && "hidden lg:flex",
          !showToggle && "max-h-[38vh] shrink-0 lg:max-h-none lg:shrink",
        )}
      >
        {leftHeader}
        {leftBody}
      </section>
      <section
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--exam-surface,#f8fafc)] lg:w-1/2",
          showToggle && mobilePanel !== "right" && "hidden lg:flex",
        )}
      >
        {right}
      </section>
    </div>
  );
}
