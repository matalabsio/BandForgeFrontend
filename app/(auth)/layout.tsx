import { AuthFontsShell } from "@/components/fonts/auth-fonts-shell";
import { MarketingFontsShell } from "@/components/fonts/marketing-fonts-shell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingFontsShell>
      <AuthFontsShell>{children}</AuthFontsShell>
    </MarketingFontsShell>
  );
}
