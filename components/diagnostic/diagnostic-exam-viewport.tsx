"use client";

import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

/** Fixed full-viewport exam frame; locks document scroll while mounted. */
export function DiagnosticExamViewport({ children }: Props) {
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-white">
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
