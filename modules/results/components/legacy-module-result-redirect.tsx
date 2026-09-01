"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ResultModule } from "@/lib/exam-session-storage";
import { listeningResultsPath } from "@/lib/listening-test";
import { readingResultsPath } from "@/lib/reading-test";

type Props = {
  attemptId: string;
  testNumber: number;
  module: ResultModule;
};

/** Legacy `/test/{module}/results/{uuid}` → short `/test/{n}/{module}/results?attempt=uuid`. */
export function LegacyModuleResultRedirect({
  attemptId,
  testNumber,
  module,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    const dest =
      module === "reading"
        ? readingResultsPath(testNumber, attemptId)
        : module === "listening"
          ? listeningResultsPath(testNumber, attemptId)
          : `/test/${testNumber}/${module}/results?attempt=${encodeURIComponent(attemptId)}`;
    router.replace(dest);
  }, [attemptId, testNumber, module, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-ink/60">
      Opening your result…
    </div>
  );
}
