import type { ReactNode } from "react";
import { ExamUrlHydrator } from "@/components/exam/exam-url-hydrator";
import { GoogleFontsLink } from "@/components/fonts/google-fonts-link";

/** Active test routes — pages compose TestShell (no marketing chrome, 4.3). */
export default function ActiveTestLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GoogleFontsLink />
      <ExamUrlHydrator />
      {children}
    </>
  );
}
