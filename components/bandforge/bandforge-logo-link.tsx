import Image from "next/image";
import Link from "next/link";
import bandforgeLogo from "@/modules/listening/img/logo.png";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "h-7 w-auto max-w-[140px] sm:max-w-[160px]",
  md: "h-9 w-auto max-w-[180px] sm:h-10 sm:max-w-[220px]",
  lg: "h-10 w-auto max-w-[200px] sm:h-11 sm:max-w-[240px]",
} as const;

type BandForgeLogoLinkProps = {
  href?: string;
  size?: keyof typeof sizeClass;
  className?: string;
  priority?: boolean;
};

/** Brand logo — links home by default. */
export function BandForgeLogoLink({
  href = "/",
  size = "md",
  className,
  priority = false,
}: BandForgeLogoLinkProps) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "inline-flex shrink-0 items-center transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 rounded-sm",
        className,
      )}
      aria-label="BandForge home"
    >
      <Image
        src={bandforgeLogo}
        alt="BandForge — AI-powered IELTS preparation"
        width={bandforgeLogo.width}
        height={bandforgeLogo.height}
        priority={priority}
        className={cn("object-contain object-left", sizeClass[size])}
      />
    </Link>
  );
}
