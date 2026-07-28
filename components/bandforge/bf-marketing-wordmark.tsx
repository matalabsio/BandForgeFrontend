import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  className?: string;
};

/** Brand logo for marketing header (mobile + desktop). */
export function BfMarketingWordmark({ href = "/", className }: Props) {
  return (
    <BandForgeLogoLink
      href={href}
      size="nav"
      className={cn(className)}
      priority
    />
  );
}
