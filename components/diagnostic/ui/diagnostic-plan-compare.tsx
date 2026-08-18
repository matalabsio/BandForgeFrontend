import Link from "next/link";
import { Check, Star } from "lucide-react";
import { bfPrimaryCtaDiagClass } from "@/components/bandforge/bf-primary-cta-styles";
import { BRAND_PLAN_PAGE_TIERS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

type Props = {
  planHref: string;
};

const FULL_SKILL_FEATURES = [
  "All four IELTS skills",
  "48 practice hubs (12 per skill)",
  "Personalised daily plan",
  "AI + Band 9 review in 48 hrs",
  "4 mocks on completion",
  "Free diagnostic included",
];

export function DiagnosticPlanCompare({ planHref }: Props) {
  const program = BRAND_PLAN_PAGE_TIERS.find((t) => t.id === "full-skill-program");

  if (!program) return null;

  return (
    <div className="mx-auto max-w-md">
      <PlanCard
        name={program.name}
        price={program.price}
        features={FULL_SKILL_FEATURES}
        href={planHref}
        variant="primary"
        badge="Recommended"
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
          primary
            ? cn(bfPrimaryCtaDiagClass, "rounded-xl text-[15px]")
            : "flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-cyan/50 font-display text-[15px] font-semibold text-teal transition-colors hover:bg-cyan/5",
        )}
      >
        <span className={cn(primary && "relative z-[1]")}>Choose {name}</span>
      </Link>
    </div>
  );
}
