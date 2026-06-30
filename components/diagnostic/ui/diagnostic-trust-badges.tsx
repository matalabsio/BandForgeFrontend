import Link from "next/link";
import {
  Award,
  BookCheck,
  GraduationCap,
  ListChecks,
  MessageCircle,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "results" | "plan";

type Props = {
  variant?: Variant;
  className?: string;
};

type TrustItem = {
  icon: LucideIcon;
  label: string;
  short: string;
  href?: string;
  linkLabel?: string;
};

const RESULTS_ITEMS: TrustItem[] = [
  { icon: ListChecks, label: "Prepare for all question types", short: "All question types" },
  { icon: BookCheck, label: "The best IELTS mock tests", short: "Best IELTS mock tests" },
  { icon: Award, label: "Built by a Gold Medallist", short: "Built by a Gold Medallist" },
  { icon: GraduationCap, label: "A decade of mentoring", short: "A decade of mentoring" },
];

const PLAN_ITEMS: TrustItem[] = [
  { icon: ShieldCheck, label: "Secure payment via Razorpay", short: "Secure via Razorpay" },
  { icon: BookCheck, label: "Cancel anytime", short: "Cancel anytime" },
  { icon: Award, label: "Band 9 trainer content", short: "Band 9 content" },
  {
    icon: MessageCircle,
    label: "Questions? WhatsApp us.",
    short: "WhatsApp support",
    href: "#",
    linkLabel: "WhatsApp us.",
  },
];

function PlanTrustLabel({ item }: { item: TrustItem }) {
  if (item.href && item.linkLabel) {
    const prefix = item.label.replace(item.linkLabel, "").trim();
    return (
      <span className="text-[13px] font-normal text-[#64748B]">
        {prefix}{" "}
        <Link
          href={item.href}
          className="cursor-pointer font-semibold text-cyan transition-colors hover:text-brand-sky-hover"
        >
          {item.linkLabel}
        </Link>
      </span>
    );
  }
  return <span className="text-[13px] font-normal text-[#64748B]">{item.label}</span>;
}

export function DiagnosticTrustBadges({ variant = "results", className }: Props) {
  const items = variant === "plan" ? PLAN_ITEMS : RESULTS_ITEMS;

  return (
    <div className={cn("border-t border-[#EDF1F6] pt-5 sm:pt-6", className)}>
      {/* Mobile: 4-column footer grid */}
      <div className="grid grid-cols-4 gap-2 sm:hidden">
        {items.map(({ icon: Icon, short, href, linkLabel }) => (
          <div
            key={short}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <Icon className="size-[18px] shrink-0 text-cyan" strokeWidth={1.8} />
            {href && linkLabel ? (
              <Link
                href={href}
                className="cursor-pointer text-[10px] leading-[1.3] font-semibold text-cyan"
              >
                {short}
              </Link>
            ) : (
              <span className="text-[10px] leading-[1.3] font-normal text-[#64748B]">
                {short}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: single row with dividers */}
      <div className="hidden flex-wrap items-center justify-center gap-x-7 gap-y-3 sm:flex lg:gap-x-[30px]">
        {items.map((item, index) => {
          const { icon: Icon } = item;
          return (
            <div key={item.label} className="flex items-center gap-2.5">
              {index > 0 ? (
                <span
                  className="mr-2 hidden h-4 w-px bg-[#E3E9F1] sm:inline-block"
                  aria-hidden
                />
              ) : null}
              <Icon className="size-[19px] shrink-0 text-cyan" strokeWidth={1.8} />
              {variant === "plan" ? (
                <PlanTrustLabel item={item} />
              ) : (
                <span className="text-[13px] font-normal text-[#64748B]">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
