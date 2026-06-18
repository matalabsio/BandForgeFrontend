import Link from "next/link";
import { ArrowRightIcon, BarChartIcon } from "@/components/bandforge/dashboard/icons";

export function ScoresPageHeader() {
  return (
    <header className="bf-dash-enter mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-cyan/12 text-cyan">
            <BarChartIcon className="size-4" />
          </span>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan">
            Analytics
          </p>
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
          Your performance
        </h1>
        <p className="mt-1 max-w-xl text-[14px] text-ink/55">
          Band trends, module breakdown, and full score reports for every
          completed mock.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-[13px] font-semibold text-ink/70 transition-colors hover:border-cyan/30 hover:text-cyan"
      >
        Back to dashboard
        <ArrowRightIcon className="size-4" />
      </Link>
    </header>
  );
}
