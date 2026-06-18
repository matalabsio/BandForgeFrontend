import Link from "next/link";
import { Share2 } from "lucide-react";
import type { ReactNode } from "react";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";

type Props = {
  module: string;
  band: number;
  targetBand?: number | null;
  children: ReactNode;
  insight?: string;
  practiceHref?: string;
  nextTestHref?: string;
  testsSubtitle?: string;
};

export function BfScoreReportShell({
  module,
  band,
  targetBand = 7.5,
  children,
  insight = "Focus on inference questions — your accuracy drops on Parts 3 and 4.",
  practiceHref = "/test",
  nextTestHref = "/test",
  testsSubtitle,
}: Props) {
  const gap =
    targetBand && band > 0 ? Math.max(0, targetBand - band) : null;
  const sliderMin = 4;
  const sliderMax = 9;
  const markerPct =
    targetBand && band > 0
      ? ((band - sliderMin) / (sliderMax - sliderMin)) * 100
      : 50;

  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="border-b border-border-soft bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <BfBrandBars size="sm" />
            <span className="font-display text-sm font-bold text-navy">
              Band<span className="text-cyan">Forge</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border-muted px-3 py-1.5 text-xs font-semibold text-navy hover:border-cyan/40"
            >
              <Share2 className="size-3.5" />
              Share
            </button>
            <p className="font-mono text-xs text-muted-light uppercase">
              Score report
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
            <p className="font-mono text-xs tracking-wide text-cyan uppercase">
              {module}
            </p>
            {testsSubtitle ? (
              <p className="mt-1 text-sm text-muted-light">{testsSubtitle}</p>
            ) : null}
            <div className="mt-4">
              <p className="text-sm text-muted">Your band</p>
              <p className="font-mono text-[3.75rem] leading-none font-medium text-cyan">
                {band > 0 ? band.toFixed(1) : "—"}
              </p>
            </div>
            {targetBand && band > 0 ? (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted">Target band {targetBand.toFixed(1)}</span>
                  {gap !== null ? (
                    <span className="font-semibold text-[#15935b]">
                      {gap.toFixed(1)} from target
                    </span>
                  ) : null}
                </div>
                <div className="relative h-2 rounded-full bg-border-soft">
                  <div
                    className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-cyan shadow"
                    style={{ left: `${Math.min(100, Math.max(0, markerPct))}%` }}
                    aria-hidden
                  />
                </div>
                <div className="mt-1 flex justify-between font-mono text-[0.625rem] text-muted-light">
                  <span>4.0</span>
                  <span>9.0</span>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-cyan/25 bg-cyan-soft/50 p-6">
            <p className="font-mono text-xs tracking-wide text-cyan uppercase">
              AI insight
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{insight}</p>
            <Link
              href={practiceHref}
              prefetch
              className="mt-4 inline-flex text-sm font-semibold text-cyan hover:text-brand-sky-hover"
            >
              Practise next →
            </Link>
          </section>
        </div>

        {children}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={nextTestHref}
            prefetch
            className="inline-flex min-h-[var(--spacing-touch)] items-center justify-center rounded-full bg-cyan px-8 font-display text-sm font-semibold text-white shadow-[0_10px_26px_rgb(0_151_167/0.26)] hover:bg-brand-sky-hover"
          >
            Begin Next Test
          </Link>
          <Link
            href="/dashboard"
            prefetch
            className="inline-flex min-h-[var(--spacing-touch)] items-center justify-center rounded-full border border-border-muted px-8 font-display text-sm font-semibold text-navy hover:border-cyan/40"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
