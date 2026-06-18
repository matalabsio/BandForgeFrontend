import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import { BRAND_DIAGNOSTIC_SECTIONS } from "@/lib/brand-mock-data";

/** Hero visual — sample diagnostic report card. */
export function BfHeroDiagnosticCard() {
  return (
    <div
      className="w-full max-w-md rounded-[1.25rem] border border-[#e9edf2] bg-white p-7 shadow-[0_30px_60px_rgb(13_31_60/0.12)] sm:max-w-lg"
      aria-hidden
    >
      <div className="mb-[22px] flex items-center justify-between gap-3">
        <p className="font-mono text-[0.6875rem] tracking-[0.1em] text-muted-light uppercase">
          Diagnostic Report
        </p>
        <span className="font-mono text-[0.6875rem] text-cyan">90:00</span>
      </div>

      <div className="mb-[26px] flex items-end gap-[18px]">
        <BfBrandBars size="card" />
        <div>
          <p className="text-[0.8125rem] text-muted-light">Overall band</p>
          <p className="font-display text-[2.875rem] leading-[0.9] font-extrabold tracking-[-0.03em] text-navy">
            7.0
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3.5">
        {BRAND_DIAGNOSTIC_SECTIONS.map((row) => (
          <li key={row.label}>
            <div className="mb-1.5 flex items-center justify-between text-[0.8125rem]">
              <span className="font-medium text-[#3f4f63]">{row.label}</span>
              <span className="font-mono text-navy">{row.score}</span>
            </div>
            <div className="h-[7px] overflow-hidden rounded bg-[#eef2f6]">
              <div
                className="h-full rounded bg-cyan"
                style={{ width: row.width }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
