import type { ModuleProgress } from "@/modules/mock/services/mock-api";

const MODULE_ORDER = ["listening", "reading", "writing", "speaking"] as const;

/** Default module rows when no mock_attempt exists yet. */
export function defaultModuleProgress(): ModuleProgress[] {
  return [
    {
      module: "listening",
      sequence_order: 1,
      status: "available",
      duration_minutes: 30,
      is_enabled: true,
      band: null,
      test_attempt_id: null,
      part: 1,
    },
    {
      module: "reading",
      sequence_order: 2,
      status: "locked",
      duration_minutes: 30,
      is_enabled: true,
      band: null,
      test_attempt_id: null,
      part: 1,
    },
    {
      module: "writing",
      sequence_order: 3,
      status: "locked",
      duration_minutes: 60,
      is_enabled: false,
      band: null,
      test_attempt_id: null,
      part: null,
    },
    {
      module: "speaking",
      sequence_order: 4,
      status: "locked",
      duration_minutes: 14,
      is_enabled: false,
      band: null,
      test_attempt_id: null,
      part: null,
    },
  ];
}

/** Percent of enabled modules marked completed (0–100). */
export function computeMockProgressPercent(modules: ModuleProgress[]): number {
  const enabled = modules.filter((m) => m.is_enabled);
  if (enabled.length === 0) return 0;
  const completed = enabled.filter((m) => m.status === "completed").length;
  return Math.round((completed / enabled.length) * 100);
}

export function sortModules(modules: ModuleProgress[]): ModuleProgress[] {
  const order = new Map(MODULE_ORDER.map((m, i) => [m, i]));
  return modules.toSorted(
    (a, b) =>
      (order.get(a.module as (typeof MODULE_ORDER)[number]) ?? 99) -
      (order.get(b.module as (typeof MODULE_ORDER)[number]) ?? 99),
  );
}
