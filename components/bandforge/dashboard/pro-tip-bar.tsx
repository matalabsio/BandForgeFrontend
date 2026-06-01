import { LightbulbIcon } from "@/components/bandforge/dashboard/icons";

export function ProTipBar() {
  return (
    <aside
      className="flex flex-col gap-3 rounded-2xl border border-[#06B6D4]/15 bg-[#06B6D4]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      aria-label="Pro tip"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#06B6D4] shadow-sm">
          <LightbulbIcon className="size-4" />
        </span>
        <p className="text-[13px] leading-snug text-[#0F172A]/75">
          <span className="font-bold text-[#0F172A]">Pro Tip: </span>
          Focus on note-completion questions: they often carry 15–20% of
          listening marks. AI tips and full coaching arrive in a few days.
        </p>
      </div>
      <span className="shrink-0 text-[12px] font-bold text-[#0F172A]/40">
        More tips soon
      </span>
    </aside>
  );
}
