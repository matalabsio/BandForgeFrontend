import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  cta: string;
  href?: string;
  recommended?: boolean;
  variant: "outline" | "primary";
};

export function BfPricingCard({
  name,
  price,
  period,
  description,
  cta,
  href = "/plan",
  recommended = false,
  variant,
}: Props) {
  const ctaClass =
    variant === "primary"
      ? "bg-cyan text-white shadow-[0_6px_16px_rgb(0_151_167/0.24)] hover:bg-brand-sky-hover lg:shadow-[0_8px_20px_rgb(0_151_167/0.26)]"
      : "border border-cyan text-cyan hover:bg-cyan-soft";

  const periodLabel = period?.replace("/ ", "") ?? null;

  return (
    <article
      className={cn(
        "relative rounded-2xl p-[22px] lg:rounded-[1.125rem] lg:p-8",
        recommended
          ? "mt-1 border-2 border-cyan shadow-[0_10px_26px_rgb(0_151_167/0.14)] lg:mt-0 lg:shadow-[0_18px_40px_rgb(0_151_167/0.16)]"
          : "border border-border-muted",
      )}
    >
      {recommended ? (
        <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 rounded-full bg-cyan px-3 py-1 font-mono text-[0.625rem] tracking-[0.1em] text-white uppercase lg:px-4 lg:text-[0.6875rem]">
          Recommended
        </span>
      ) : null}

      <div className="flex items-baseline justify-between gap-4 lg:block">
        <h3 className="font-display text-lg font-bold text-navy lg:text-xl">
          {name}
        </h3>
        <div className="shrink-0 text-right lg:mt-3 lg:text-left">
          <span
            className={cn(
              "font-mono text-xl font-medium lg:text-[2.125rem]",
              recommended ? "text-cyan" : "text-navy",
            )}
          >
            {price}
          </span>
          {periodLabel ? (
            <p className="text-[0.6875rem] text-muted-light lg:text-sm">
              <span className="lg:hidden">{periodLabel}</span>
              <span className="hidden lg:inline">{period}</span>
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-[0.84375rem] leading-normal text-muted lg:mt-4 lg:text-sm lg:leading-relaxed">
        {description}
      </p>
      <Link
        href={href}
        prefetch
        className={cn(
          "mt-4 flex w-full items-center justify-center rounded-full py-3 font-display text-sm font-semibold transition-colors lg:mt-6 lg:min-h-[var(--spacing-touch)] lg:text-[0.9375rem]",
          recommended ? "py-[13px]" : "",
          ctaClass,
        )}
      >
        {cta}
      </Link>
    </article>
  );
}
