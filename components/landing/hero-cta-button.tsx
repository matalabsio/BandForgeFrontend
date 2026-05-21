import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

const heroCtaBase =
  "group inline-flex min-h-[var(--spacing-touch)] w-full cursor-pointer items-center justify-center gap-2 rounded-md px-5 py-3.5 text-body font-semibold shadow-[var(--shadow-soft)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 sm:w-auto sm:min-w-[200px] sm:max-w-[280px] motion-reduce:transition-none";

const heroCtaVariantClass = {
  primary:
    "bg-navy text-white hover:bg-navy/90 focus-visible:ring-offset-white",
  secondary:
    "border-2 border-navy bg-white text-navy hover:bg-surface focus-visible:ring-offset-white",
} as const;

type HeroCtaVariant = keyof typeof heroCtaVariantClass;

type HeroCtaButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: HeroCtaVariant;
  className?: string;
};

export function HeroCtaButton({
  href,
  children,
  variant = "primary",
  className,
}: HeroCtaButtonProps) {
  return (
    <Link
      href={href}
      className={cn(heroCtaBase, heroCtaVariantClass[variant], className)}
    >
      <span className="text-center leading-snug">{children}</span>
      <IconArrowRight
        className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden
      />
    </Link>
  );
}
