import type { ReactNode } from "react";
import { ExamUrlHydrator } from "@/components/exam/exam-url-hydrator";
import { MarketingFontsShell } from "@/components/fonts/marketing-fonts-shell";

export default function DiagnosticLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingFontsShell>
      <ExamUrlHydrator />
      {children}
    </MarketingFontsShell>
  );
}
