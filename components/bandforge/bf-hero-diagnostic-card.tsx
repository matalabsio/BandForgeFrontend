import type { CSSProperties } from "react";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import { BRAND_DIAGNOSTIC_SECTIONS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Distinct fill per skill — aligned with hero / brand palette. */
const SECTION_BAR_COLORS: Record<
  (typeof BRAND_DIAGNOSTIC_SECTIONS)[number]["label"],
  string
> = {
  Listening: "#0097a7",
  Reading: "#00bcd4",
  Writing: "#DC143C",
  Speaking: "#0d1f3c",
};

/** Hero visual — sample diagnostic report card. */
export function BfHeroDiagnosticCard({ className }: Props) {
  return (
    <div
      className={cn(
        "min-h-[17.5rem] rounded-[1.125rem] border border-[#e9edf2] bg-white p-5 shadow-[0_20px_48px_rgb(13_31_60/0.1)] sm:min-h-[19rem] sm:rounded-[1.25rem] sm:p-7 lg:shadow-[0_30px_60px_rgb(13_31_60/0.12)]",
        className,
      )}
      aria-hidden
    >
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-[22px]">
        <p className="font-mono text-[0.625rem] tracking-[0.1em] text-muted-light uppercase sm:text-[0.6875rem]">
          Diagnostic Report
        </p>
        <span className="font-mono text-[0.625rem] text-cyan sm:text-[0.6875rem]">90:00</span>
      </div>

      <div className="mb-5 flex items-end gap-3 sm:mb-[26px] sm:gap-[18px]">
        <BfBrandBars size="card" className="scale-90 sm:scale-100" />
        <div>
          <p className="text-xs text-muted-light sm:text-[0.8125rem]">Overall band</p>
          <p className="font-display text-[2.25rem] leading-[0.9] font-extrabold tracking-[-0.03em] text-navy sm:text-[2.875rem]">
            7.0
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3.5 sm:gap-4">
        {BRAND_DIAGNOSTIC_SECTIONS.map((row, index) => (
          <li key={row.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs sm:text-[0.8125rem]">
              <span className="font-medium text-[#3f4f63]">{row.label}</span>
              <span className="font-mono text-navy">{row.score}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#eef2f6]">
              <div
                className="bf-hero-bar-fill h-full rounded-full"
                style={
                  {
                    width: row.width,
                    backgroundColor: SECTION_BAR_COLORS[row.label],
                    "--bf-bar-delay": `${0.18 + index * 0.1}s`,
                  } as CSSProperties
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
