import Image from "next/image";
import Link from "next/link";
import bandforgeLogo from "@/logo.png";
import { cn } from "@/lib/utils";

const sizeClass = {
  nav: "h-8 w-auto max-w-[190px] sm:h-9 sm:max-w-[210px]",
  sm: "h-7 w-auto max-w-[180px] sm:max-w-[200px]",
  md: "h-9 w-auto max-w-[220px] sm:h-10 sm:max-w-[260px]",
  lg: "h-10 w-auto max-w-[260px] sm:h-11 sm:max-w-[300px]",
  /** Compact mark for dense chrome / collapsed rails */
  mark: "h-7 w-auto max-w-[140px]",
} as const;

type BandForgeLogoLinkProps = {
  href?: string;
  size?: keyof typeof sizeClass;
  className?: string;
  priority?: boolean;
  /**
   * Navy “Band” text is hard to read on dark surfaces — wrap the asset in a
   * light plate so the same logo file stays legible.
   */
  onDark?: boolean;
};

/** Brand logo — single asset (`logo.png` / Group 103). Links home by default. */
export function BandForgeLogoLink({
  href = "/",
  size = "md",
  className,
  priority = false,
  onDark = false,
}: BandForgeLogoLinkProps) {
  const image = (
    <Image
      src={bandforgeLogo}
      alt="BandForge — AI-powered IELTS preparation"
      width={bandforgeLogo.width}
      height={bandforgeLogo.height}
      priority={priority}
      className={cn("object-contain object-left", sizeClass[size])}
    />
  );

  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "inline-flex shrink-0 items-center transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 rounded-sm",
        onDark && "rounded-md bg-white px-2 py-1",
        className,
      )}
      aria-label="BandForge home"
    >
      {image}
    </Link>
  );
}

/** Non-linking logo image (decorative / already inside a parent link). */
export function BandForgeLogoMark({
  size = "md",
  className,
  priority = false,
}: {
  size?: keyof typeof sizeClass;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={bandforgeLogo}
      alt="BandForge"
      width={bandforgeLogo.width}
      height={bandforgeLogo.height}
      priority={priority}
      className={cn("object-contain object-left", sizeClass[size], className)}
    />
  );
}
