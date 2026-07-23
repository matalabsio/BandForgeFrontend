import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import type { ReactNode } from "react";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700"],
  // Preload so Bricolage is available in the optional short block window;
  // avoid swap (late webfont paint can extend LCP).
  display: "optional",
  adjustFontFallback: true,
  preload: true,
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "optional",
  adjustFontFallback: true,
  // Body face — do not compete with Bricolage preload for H1 LCP.
  preload: false,
});

/** Marketing typography — Bricolage + DM Sans only (no mono preload). */
export function MarketingFontsShell({ children }: { children: ReactNode }) {
  return (
    <div className={`${bricolage.variable} ${dmSans.variable} min-h-dvh`}>
      {children}
    </div>
  );
}
