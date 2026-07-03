"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { InstallPromptProvider } from "@/lib/pwa/install-prompt-context";

export function PwaRoot({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js">
      <InstallPromptProvider>{children}</InstallPromptProvider>
    </SerwistProvider>
  );
}
