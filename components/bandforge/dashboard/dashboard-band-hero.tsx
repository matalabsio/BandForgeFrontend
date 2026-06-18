import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { marketingAppHref } from "@/components/bandforge/bf-marketing-auth-links";
import { BRAND_DASHBOARD_MODULE_PROGRESS } from "@/lib/brand-mock-data";

type EmptyProps = {
  firstName: string;
};

export function DashboardEmptyHero({ firstName }: EmptyProps) {
  const name = firstName.trim() || "there";

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-[1.6875rem] leading-tight font-bold tracking-[-0.02em] text-navy lg:text-[2.125rem]">
          Welcome, {name}.
        </h2>
        <p className="mt-2 max-w-[60ch] text-[0.90625rem] leading-relaxed font-light text-muted lg:text-base">
          Your IELTS journey starts with one test. Take your diagnostic to see
          exactly where you stand.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[1.25rem] bg-navy p-6 shadow-[0_16px_34px_rgb(13_31_60/0.22)] lg:px-[22px] lg:py-6">
        <div
          className="pointer-events-none absolute -top-[60px] -right-[50px] size-[190px] rounded-full bg-[radial-gradient(circle,rgb(0_188_212/0.42),transparent_70%)]"
          aria-hidden
        />
        <div className="relative">
          <div className="mb-3.5 inline-flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-cyan uppercase">
            <span className="size-1.5 rounded-full bg-cyan" aria-hidden />
            Free diagnostic
          </div>
          <h3 className="font-display text-[1.4375rem] leading-[1.15] font-bold tracking-[-0.015em] text-white">
            Take Your Free
            <br />
            Diagnostic Test
          </h3>
          <p className="mt-2.5 text-[0.8125rem] font-light text-slate">
            90 minutes · All 4 sections · AI-evaluated
          </p>
          <Link
            href={marketingAppHref()}
            prefetch
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan px-[26px] py-[13px] text-[0.9375rem] font-semibold text-white shadow-[0_8px_20px_rgb(0_151_167/0.4)] transition-colors hover:bg-brand-sky-hover"
          >
            Start Diagnostic
            <ArrowRight className="size-[17px]" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </section>
  );
}

type BandHeroProps = {
  overallBand?: number;
  bandDelta?: number;
  testsCompleted?: number;
};

export function DashboardBandHero({
  overallBand = 6.5,
  bandDelta = 0.5,
  testsCompleted = 2,
}: BandHeroProps) {
  return (
    <section className="rounded-[1.25rem] border border-border-soft bg-white p-6 shadow-[0_8px_22px_rgb(13_31_60/0.05)] sm:px-8 sm:py-[26px]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display mb-2.5 text-[1.1875rem] font-bold tracking-tight text-navy">
            Your Expected Band
          </p>
          <div className="flex items-end gap-3.5">
            <p className="font-mono text-[3.75rem] leading-[0.9] font-medium text-cyan">
              {overallBand.toFixed(1)}
            </p>
            {bandDelta > 0 ? (
              <span className="mb-2.5 inline-flex items-center gap-1 rounded-full bg-[#e7f7ee] px-2.5 py-1">
                <TrendingUp className="size-3.5 text-[#15935b]" strokeWidth={2.6} />
                <span className="text-[0.8125rem] font-semibold text-[#15935b]">
                  +{bandDelta.toFixed(1)}
                </span>
              </span>
            ) : null}
          </div>
          <p className="mt-2.5 text-sm font-light text-muted">
            Based on {testsCompleted} test{testsCompleted === 1 ? "" : "s"}{" "}
            completed
          </p>
        </div>
        <div className="hidden gap-7 border-l border-border-soft pl-8 lg:flex">
          {BRAND_DASHBOARD_MODULE_PROGRESS.map((mod) => (
            <div key={mod.key} className="text-center">
              <p className="font-mono text-2xl leading-none font-medium text-navy">
                {mod.band?.toFixed(1) ?? "—"}
              </p>
              <p className="mt-1.5 text-[0.71875rem] text-muted-light">
                {mod.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
