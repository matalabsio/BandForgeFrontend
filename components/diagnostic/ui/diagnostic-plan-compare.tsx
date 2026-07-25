import Link from "next/link";
import { Check, Star } from "lucide-react";
import { BRAND_PLAN_PAGE_TIERS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

type Props = {
  planHref: string;
};

const DUAL_FEATURES = [
  "Writing + Speaking",
  "12 tasks per track",
  "AI + Band 9 review",
  "1 mock on completion",
];

const ALL_SKILLS_FEATURES = [
  "All four IELTS skills",
  "12 structured tasks",
  "AI + Band 9 review",
  "1 mock on completion",
  "Free diagnostic included",
];

export function DiagnosticPlanCompare({ planHref }: Props) {
  const dual = BRAND_PLAN_PAGE_TIERS.find((t) => t.id === "dual");
  const allSkills = BRAND_PLAN_PAGE_TIERS.find((t) => t.id === "all-skills");

  if (!dual || !allSkills) return null;

  return (
    <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4">
      <PlanCard
        name="Dual"
        price={dual.price}
        features={DUAL_FEATURES}
        href={planHref}
        variant="outline"
      />
      <PlanCard
        name="All Skills"
        price={allSkills.price}
        features={ALL_SKILLS_FEATURES}
        href={planHref}
        variant="primary"
        badge="Most Popular"
      />
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  href,
  variant,
  badge,
}: {
  name: string;
  price: string;
  features: string[];
  href: string;
  variant: "outline" | "primary";
  badge?: string;
}) {
  const primary = variant === "primary";

  return (
    <div
      className={cn(
        "rounded-[18px] p-5 sm:p-[22px]",
        primary
          ? "border-[1.5px] border-cyan bg-[#F4F7FA] shadow-[0_0_0_4px_rgba(0,188,212,0.10)]"
          : "border border-navy/10 bg-[#F4F7FA]",
      )}
    >
      {badge ? (
        <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-cyan px-2.5 py-1.5">
          <Star className="size-2.5 fill-[#06222B] text-[#06222B]" />
          <span className="font-mono text-[10px] font-medium tracking-wider text-[#06222B] uppercase">
            {badge}
          </span>
        </span>
      ) : null}
      <div className="font-display text-lg font-bold text-navy">{name}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="font-mono text-[30px] font-medium text-teal">{price}</span>
        <span className="text-xs text-[#6E83A0]">one-time</span>
      </div>
      <ul className="mt-4 mb-5 flex flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="size-[15px] shrink-0 text-cyan" strokeWidth={2.6} />
            <span className="text-[13px] font-light text-[#3D4D63]">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={cn(
          "flex h-12 w-full cursor-pointer items-center justify-center rounded-xl font-display text-[15px] font-semibold transition-colors",
          primary
            ? "bg-cyan text-[#06222B] shadow-[0_12px_26px_rgba(0,188,212,0.28)] hover:bg-brand-sky-hover"
            : "border-[1.5px] border-cyan/50 text-teal hover:bg-cyan/5",
        )}
      >
        Choose {name}
      </Link>
    </div>
  );
}
