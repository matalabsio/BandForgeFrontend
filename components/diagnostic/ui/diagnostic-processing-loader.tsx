import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";

export function DiagnosticProcessingLoader() {
  return (
    <div className="relative mx-auto mb-9 size-[72px]">
      <div className="absolute inset-0 rounded-full border-[3px] border-navy/8" />
      <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-teal border-r-teal" />
      <div className="absolute inset-0 flex items-center justify-center">
        <BfBrandBars size="sm" />
      </div>
    </div>
  );
}
