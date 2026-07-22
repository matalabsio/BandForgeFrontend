import { MarketingFontsShell } from "@/components/fonts/marketing-fonts-shell";

/** Shared marketing route group — one compile chunk for public BandForge pages. */
export const revalidate = 300;

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingFontsShell>{children}</MarketingFontsShell>;
}
