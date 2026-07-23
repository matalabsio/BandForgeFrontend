import type { CSSProperties, ReactNode } from "react";

/**
 * Auth-only Bitter/Lora via stylesheet link (not next/font).
 * Avoids shipping auth serif @font-face CSS on marketing LCP pages.
 */
export function AuthFontsShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-dvh"
      style={
        {
          "--font-bitter-loaded": '"Bitter"',
          "--font-lora-loaded": '"Lora"',
        } as CSSProperties
      }
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Bitter:wght@400;700;800&family=Lora:wght@400;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </div>
  );
}
