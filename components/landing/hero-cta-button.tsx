import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { IconArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

const heroCtaVariants = cva(
  "group inline-flex min-h-[var(--spacing-touch)] w-full cursor-pointer items-center justify-center gap-2 rounded-md px-5 py-3.5 text-body font-semibold shadow-[var(--shadow-soft)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 sm:w-auto sm:min-w-[200px] sm:max-w-[280px] motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary: "bg-navy text-white hover:bg-navy/90 focus-visible:ring-offset-white",
        secondary:
          "border-2 border-navy bg-white text-navy hover:bg-surface focus-visible:ring-offset-white",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type HeroCtaButtonProps = VariantProps<typeof heroCtaVariants> & {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function HeroCtaButton({
  href,
  children,
  variant,
  className,
}: HeroCtaButtonProps) {
  return (
    <Link href={href} className={cn(heroCtaVariants({ variant }), className)}>
      <span className="text-center leading-snug">{children}</span>
      <IconArrowRight
        className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden
      />
    </Link>
  );
}
