import type {
  ModuleProgress,
  ModuleProgressStatus,
} from "@/modules/mock/services/mock-api";

export const MOCK_MODULE_ORDER = [
  "listening",
  "reading",
  "writing",
  "speaking",
] as const;

export type MockModuleKey = (typeof MOCK_MODULE_ORDER)[number];

export const MOCK_MODULE_ABBREV: Record<MockModuleKey, string> = {
  listening: "L",
  reading: "R",
  writing: "W",
  speaking: "S",
};

const DEFAULT_PRESTART_MODULES: MockModuleKey[] = [
  "listening",
  "reading",
  "writing",
];

/**
 * Testing mode: any enabled module is startable (no sequential lock UI).
 * Set NEXT_PUBLIC_MOCK_FREE_MODULE_ACCESS=0 to restore exam-order locks.
 */
export function isMockFreeModuleAccess(): boolean {
  const raw = (process.env.NEXT_PUBLIC_MOCK_FREE_MODULE_ACCESS ?? "1")
    .trim()
    .toLowerCase();
  return raw !== "0" && raw !== "false" && raw !== "no" && raw !== "off";
}

/** Map API `locked` → `available` while free module access is on. */
export function effectiveModuleStatus(
  status: ModuleProgressStatus,
): ModuleProgressStatus {
  if (isMockFreeModuleAccess() && status === "locked") return "available";
  return status;
}

export function withFreeModuleAccess(
  modules: ModuleProgress[],
): ModuleProgress[] {
  if (!isMockFreeModuleAccess()) return modules;
  return modules.map((m) =>
    m.status === "locked" ? { ...m, status: "available" as const } : m,
  );
}

/** Enabled module keys from progress API, catalog, or L+R+W default. */
export function resolveEnabledModuleKeys(
  progressModules: ModuleProgress[],
  catalogModulesEnabled?: readonly string[],
): MockModuleKey[] {
  const fromProgress = progressModules
    .filter((m) => m.is_enabled)
    .map((m) => m.module as MockModuleKey);
  if (fromProgress.length > 0) {
    return MOCK_MODULE_ORDER.filter((key) => fromProgress.includes(key));
  }
  if (catalogModulesEnabled && catalogModulesEnabled.length > 0) {
    return MOCK_MODULE_ORDER.filter((key) =>
      catalogModulesEnabled.includes(key),
    );
  }
  return DEFAULT_PRESTART_MODULES;
}

export function formatModuleAbbrev(keys: readonly MockModuleKey[]): string {
  return keys.map((key) => MOCK_MODULE_ABBREV[key]).join(" · ");
}

export function isModuleEnabledInCatalog(
  module: MockModuleKey,
  progressModules: ModuleProgress[],
  catalogModulesEnabled?: readonly string[],
): boolean {
  const mod = progressModules.find((m) => m.module === module);
  if (mod) return mod.is_enabled;
  if (catalogModulesEnabled && catalogModulesEnabled.length > 0) {
    return catalogModulesEnabled.includes(module);
  }
  return DEFAULT_PRESTART_MODULES.includes(module);
}

/** Default module rows when no mock_attempt exists yet. */
export function defaultModuleProgress(): ModuleProgress[] {
  const open = isMockFreeModuleAccess();
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
      status: open ? "available" : "locked",
      duration_minutes: 30,
      is_enabled: true,
      band: null,
      test_attempt_id: null,
      part: 1,
    },
    {
      module: "writing",
      sequence_order: 3,
      status: open ? "available" : "locked",
      duration_minutes: 60,
      is_enabled: false,
      band: null,
      test_attempt_id: null,
      part: null,
    },
    {
      module: "speaking",
      sequence_order: 4,
      status: open ? "available" : "locked",
      duration_minutes: 14,
      is_enabled: false,
      band: null,
      test_attempt_id: null,
      part: null,
    },
  ];
}

/** Preview rows before a mock attempt exists — all startable in free-access mode. */
export function previewModulesForKeys(
  enabledKeys: readonly MockModuleKey[],
): ModuleProgress[] {
  const open = isMockFreeModuleAccess();
  return enabledKeys.map((key, index) => ({
    module: key,
    sequence_order: index + 1,
    status: open || index === 0 ? ("available" as const) : ("locked" as const),
    duration_minutes:
      key === "writing" ? 60 : key === "speaking" ? 14 : 30,
    is_enabled: true,
    band: null,
    test_attempt_id: null,
    part: 1,
  }));
}

/** Percent of enabled modules marked completed (0–100). */
export function computeMockProgressPercent(modules: ModuleProgress[]): number {
  const enabled = modules.filter((m) => m.is_enabled);
  if (enabled.length === 0) return 0;
  const completed = enabled.filter((m) => m.status === "completed").length;
  return Math.round((completed / enabled.length) * 100);
}

export function sortModules(modules: ModuleProgress[]): ModuleProgress[] {
  const order = new Map(MOCK_MODULE_ORDER.map((m, i) => [m, i]));
  return modules.toSorted(
    (a, b) =>
      (order.get(a.module as MockModuleKey) ?? 99) -
      (order.get(b.module as MockModuleKey) ?? 99),
  );
}
