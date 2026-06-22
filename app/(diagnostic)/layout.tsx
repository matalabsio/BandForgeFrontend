import type { ReactNode } from "react";
import { ExamUrlHydrator } from "@/components/exam/exam-url-hydrator";

export default function DiagnosticLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ExamUrlHydrator />
      {children}
    </>
  );
}
