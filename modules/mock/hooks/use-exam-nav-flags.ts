import type { ResultModule } from "@/lib/exam-session-storage";
import {
  consumeExamNavFlags,
  peekExamNavFlags,
} from "@/lib/exam-session-storage";
import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";

type Options = {
  testNumber: number;
  module: ResultModule;
};

/** Resolve auto / section_start from sessionStorage (or legacy one-hop query). */
export function useExamNavFlags({ testNumber, module }: Options) {
  const searchParams = useSearchParams();
  const consumedRef = useRef(false);

  const legacyAuto = searchParams.get("auto") === "1";
  const legacySectionStart = searchParams.get("section_start") === "1";

  const sessionFlags = useMemo(
    () => peekExamNavFlags(testNumber, module),
    [testNumber, module, legacyAuto, legacySectionStart],
  );

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;
    consumeExamNavFlags(testNumber, module);
  }, [testNumber, module]);

  return {
    autoStart: sessionFlags.auto || legacyAuto,
    sectionStart: sessionFlags.sectionStart || legacySectionStart,
  };
}
