"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { persistModuleResultAttempt } from "@/lib/exam-session-storage";
import type { ResultModule } from "@/lib/exam-session-storage";
import { shortModuleResultsPath } from "@/lib/module-results-path";

type Props = {
  attemptId: string;
  testNumber: number;
  module: ResultModule;
};

/** Legacy `/test/{module}/results/{uuid}` → short `/test/{n}/{module}/results`. */
export function LegacyModuleResultRedirect({
  attemptId,
  testNumber,
  module,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    persistModuleResultAttempt(testNumber, module, attemptId);
    router.replace(shortModuleResultsPath(testNumber, module));
  }, [attemptId, testNumber, module, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-ink/60">
      Opening your result…
    </div>
  );
}
