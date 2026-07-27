import type { SplitShellStep } from "@/components/diagnostic/diagnostic-split-shell";
import type { DiagnosticModule } from "@/lib/diagnostic-storage";

export const DIAGNOSTIC_EXAM_STEPS: SplitShellStep[] = [
  { id: "listening", label: "Listening" },
  { id: "reading", label: "Reading" },
  { id: "writing", label: "Writing" },
  { id: "speaking", label: "Speaking" },
];

const MODULE_INDEX: Record<DiagnosticModule, number> = {
  listening: 0,
  reading: 1,
  writing: 2,
  speaking: 3,
};

export function examStepIndex(module: DiagnosticModule): number {
  return MODULE_INDEX[module];
}
