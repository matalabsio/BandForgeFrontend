import { BandForgeHeader } from "@/components/bandforge/bf-header";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";

type MarketingShellProps = {
  children: React.ReactNode;
};

/** Shared chrome for legal and contact pages — matches BandForge shell */
export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-ink">
      <BandForgeHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <BandForgeSiteFooter />
    </div>
  );
}
