import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import type { ReactNode } from "react";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "optional",
  adjustFontFallback: true,
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "optional",
  adjustFontFallback: true,
});

/** Marketing typography — Bricolage + DM Sans only (no mono preload). */
export function MarketingFontsShell({ children }: { children: ReactNode }) {
  return (
    <div className={`${bricolage.variable} ${dmSans.variable} contents`}>
      {children}
    </div>
  );
}
