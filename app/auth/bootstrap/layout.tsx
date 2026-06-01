import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signing in · BandForge",
  robots: { index: false, follow: false },
};

export default function AuthBootstrapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
