import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import { SectionSubmittedBadge } from "./section-submitted-badge";

type Props = {
  logoHref?: string;
  badgeVariant?: "submitted" | "time-expired" | "all-correct";
};

export function SectionResultsBrandBar({
  logoHref = "/dashboard",
  badgeVariant = "submitted",
}: Props) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
      <BandForgeLogoLink href={logoHref} size="sm" className="min-w-0" />
      <SectionSubmittedBadge variant={badgeVariant} className="mb-0 shrink-0" />
    </div>
  );
}
