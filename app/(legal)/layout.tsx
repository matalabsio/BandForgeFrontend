import { MarketingFontsShell } from "@/components/fonts/marketing-fonts-shell";

/** Legal policies — forever static; do not inherit marketing ISR. */
export const dynamic = "force-static";
export const revalidate = false;

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingFontsShell>{children}</MarketingFontsShell>;
}
