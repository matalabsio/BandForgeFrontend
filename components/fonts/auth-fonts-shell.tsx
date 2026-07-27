import { Bitter, Lora } from "next/font/google";
import type { ReactNode } from "react";

/**
 * Auth-only Bitter/Lora via next/font (not a body <link> stylesheet).
 * Avoids shipping auth serif @font-face CSS on marketing LCP pages, and
 * avoids React 19 / Next metadata hydration clashes from hoisted head links.
 */
const bitter = Bitter({
  variable: "--font-bitter-loaded",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
  preload: false,
});

const lora = Lora({
  variable: "--font-lora-loaded",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export function AuthFontsShell({ children }: { children: ReactNode }) {
  return (
    <div className={`${bitter.variable} ${lora.variable} min-h-dvh`}>
      {children}
    </div>
  );
}
