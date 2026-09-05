import {
  M01_MOCK_TEST_ID,
  M02_MOCK_TEST_ID,
  type MockSlug,
} from "@/lib/mock-catalog";
import type { PracticeSkill } from "@/lib/practice-types";

export type PlanTaskKind = "watch" | "practice" | "submit";

export type ModuleTargetConfig = {
  type?: string;
  module?: string;
  href?: string;
  catalog_number?: number;
  part?: number;
  hub_id?: string;
};

const SKILLS_WITH_SUBMIT = new Set<PracticeSkill>(["writing", "speaking"]);

/** Next step in the same skill stack (Watch → Practice → Submit). */
export function nextPlanTask(
  current: PlanTaskKind | null | undefined,
  skill: PracticeSkill,
): PlanTaskKind | null {
  if (current === "watch") return "practice";
  if (current === "practice" && SKILLS_WITH_SUBMIT.has(skill)) return "submit";
  return null;
}

/** Swap task type segment inside `t-{date}-{skill}-{type}-s{slot}`. */
export function swapPlanTaskId(
  taskId: string | null | undefined,
  nextType: PlanTaskKind,
): string | null {
  if (!taskId) return null;
  const next = taskId.replace(
    /-(watch|practice|submit)-/,
    `-${nextType}-`,
  );
  return next === taskId ? null : next;
}

/** Odd bank → Mock Test 1, even → Mock Test 2. */
export function planMockSlugForBank(bankNumber: number): MockSlug {
  return bankNumber % 2 === 0 ? "m02" : "m01";
}

export function planMockTestIdForBank(bankNumber: number): string {
  return planMockSlugForBank(bankNumber) === "m02"
    ? M02_MOCK_TEST_ID
    : M01_MOCK_TEST_ID;
}

/** Practice → Task 1, Submit → Task 2 (Writing) when no hub part. */
export function planWritingPart(task: PlanTaskKind): 1 | 2 {
  return task === "submit" ? 2 : 1;
}

function catalogFromOpts(
  catalogNumber?: number | null,
  bankNumber?: number | null,
): 1 | 2 {
  if (catalogNumber === 1 || catalogNumber === 2) return catalogNumber;
  if (bankNumber != null && bankNumber % 2 === 0) return 2;
  return 1;
}

function partFromConfig(
  submitConfig?: ModuleTargetConfig | null,
  fallback?: number | null,
): number | null {
  const raw = submitConfig?.part ?? fallback;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function planHubHref(opts: {
  skill: PracticeSkill;
  hubId: string;
  task: PlanTaskKind;
  taskId?: string | null;
}): string {
  const q = new URLSearchParams({ from: "plan", task: opts.task });
  if (opts.taskId) q.set("taskId", opts.taskId);
  return `/practice/${opts.skill}/${opts.hubId}?${q.toString()}`;
}

export function planExerciseHref(opts: {
  skill: PracticeSkill;
  hubId: string;
  task: PlanTaskKind;
  taskId?: string | null;
}): string {
  const q = new URLSearchParams({ from: "plan", task: opts.task });
  if (opts.taskId) q.set("taskId", opts.taskId);
  return `/practice/${opts.skill}/${opts.hubId}/exercise?${q.toString()}`;
}

/** Real Writing module (MT1/MT2 prompts + exam UI), not the thin bank form. */
export function planWritingModuleHref(opts: {
  hubId: string;
  task: PlanTaskKind;
  taskId?: string | null;
  bankNumber?: number;
  catalogNumber?: number | null;
  part?: number | null;
  submitConfig?: ModuleTargetConfig | null;
}): string {
  const catalog = catalogFromOpts(
    opts.submitConfig?.catalog_number ?? opts.catalogNumber,
    opts.bankNumber,
  );
  const configured = partFromConfig(opts.submitConfig, opts.part);
  const part = (configured ?? planWritingPart(opts.task)) as 1 | 2;
  const mock = catalog === 2 ? "m02" : "m01";
  const q = new URLSearchParams({
    auto: "1",
    skill_context: "writing",
    from: "plan",
    task: opts.task,
    hubId: opts.hubId,
    mock,
  });
  if (opts.taskId) q.set("taskId", opts.taskId);
  return `/test/writing/task/${part}?${q.toString()}`;
}

/** Real Listening module — hub catalog_number + part when known. */
export function planListeningModuleHref(opts: {
  hubId: string;
  task: PlanTaskKind;
  taskId?: string | null;
  bankNumber?: number;
  catalogNumber?: number | null;
  part?: number | null;
  submitConfig?: ModuleTargetConfig | null;
}): string {
  const catalog = catalogFromOpts(
    opts.submitConfig?.catalog_number ?? opts.catalogNumber,
    opts.bankNumber,
  );
  const part = partFromConfig(opts.submitConfig, opts.part) ?? 1;
  const q = new URLSearchParams({
    part: String(part),
    auto: "1",
    skill_context: "listening",
    from: "plan",
    task: opts.task,
    hubId: opts.hubId,
  });
  if (opts.taskId) q.set("taskId", opts.taskId);
  return `/test/${catalog}/listening?${q.toString()}`;
}

/** Real Reading module — hub catalog_number + passage when known. */
export function planReadingModuleHref(opts: {
  hubId: string;
  task: PlanTaskKind;
  taskId?: string | null;
  bankNumber?: number;
  catalogNumber?: number | null;
  part?: number | null;
  submitConfig?: ModuleTargetConfig | null;
}): string {
  const catalog = catalogFromOpts(
    opts.submitConfig?.catalog_number ?? opts.catalogNumber,
    opts.bankNumber,
  );
  const passage = partFromConfig(opts.submitConfig, opts.part) ?? 1;
  const q = new URLSearchParams({
    passage: String(passage),
    auto: "1",
    skill_context: "reading",
    from: "plan",
    task: opts.task,
    hubId: opts.hubId,
  });
  if (opts.taskId) q.set("taskId", opts.taskId);
  return `/test/${catalog}/reading?${q.toString()}`;
}

/** Real Speaking module — uses full speaking exam flow from MTS prompts. */
export function planSpeakingModuleHref(opts: {
  hubId: string;
  task: PlanTaskKind;
  taskId?: string | null;
  bankNumber?: number;
  catalogNumber?: number | null;
  submitConfig?: ModuleTargetConfig | null;
}): string {
  const catalog = catalogFromOpts(
    opts.submitConfig?.catalog_number ?? opts.catalogNumber,
    opts.bankNumber,
  );
  const q = new URLSearchParams({
    auto: "1",
    skill_context: "speaking",
    from: "plan",
    task: opts.task,
    hubId: opts.hubId,
  });
  if (opts.taskId) q.set("taskId", opts.taskId);
  return `/test/${catalog}/speaking?${q.toString()}`;
}

function isBankSubmitConfig(
  cfg: ModuleTargetConfig | null | undefined,
): boolean {
  if (!cfg) return false;
  if (cfg.type === "bank") return true;
  return typeof cfg.href === "string" && cfg.href.includes("/practice/");
}

/**
 * Prefer hub submit_config.href (module UI) when present; else skill builders.
 * Bank hubs stay on /practice/{skill}/{hubId}/exercise — never mock /test.
 */
export function planStepOpenHref(opts: {
  skill: PracticeSkill;
  hubId: string;
  task: PlanTaskKind;
  taskId?: string | null;
  bankNumber?: number;
  catalogNumber?: number | null;
  part?: number | null;
  submitConfig?: ModuleTargetConfig | null;
}): string {
  const cfg = opts.submitConfig;
  if (isBankSubmitConfig(cfg)) {
    return planExerciseHref({
      skill: opts.skill,
      hubId: opts.hubId,
      task: opts.task,
      taskId: opts.taskId,
    });
  }
  if (cfg?.href && typeof cfg.href === "string" && cfg.href.includes("/test/")) {
    const url = new URL(cfg.href, "http://localhost");
    url.searchParams.set("from", "plan");
    url.searchParams.set("task", opts.task);
    url.searchParams.set("hubId", opts.hubId);
    if (opts.taskId) url.searchParams.set("taskId", opts.taskId);
    if (!url.searchParams.get("skill_context")) {
      url.searchParams.set("skill_context", opts.skill);
    }
    if (!url.searchParams.get("auto")) url.searchParams.set("auto", "1");
    return `${url.pathname}${url.search}`;
  }

  if (opts.skill === "writing") {
    return planWritingModuleHref(opts);
  }
  if (opts.skill === "listening") {
    return planListeningModuleHref(opts);
  }
  if (opts.skill === "reading") {
    return planReadingModuleHref(opts);
  }
  if (opts.skill === "speaking") {
    return planSpeakingModuleHref(opts);
  }
  return planExerciseHref({
    skill: opts.skill,
    hubId: opts.hubId,
    task: opts.task,
    taskId: opts.taskId,
  });
}

/** After finishing a plan step: next exercise/hub/module, or Today. */
export function afterPlanStepHref(opts: {
  skill: PracticeSkill;
  hubId: string;
  currentTask: PlanTaskKind | null | undefined;
  currentTaskId?: string | null;
  bankNumber?: number;
  catalogNumber?: number | null;
  part?: number | null;
  submitConfig?: ModuleTargetConfig | null;
  /**
   * When true, open the exercise/module for the next step.
   * Default: only auto-open when moving into Practice (not Submit hub).
   */
  preferExercise?: boolean;
}): string {
  const next = nextPlanTask(opts.currentTask, opts.skill);
  if (!next) return "/study-plan/today";
  const nextId = swapPlanTaskId(opts.currentTaskId, next);
  const openExercise =
    opts.preferExercise === true
      ? next === "practice" || next === "submit"
      : opts.preferExercise === false
        ? false
        : next === "practice";

  if (openExercise) {
    return planStepOpenHref({
      skill: opts.skill,
      hubId: opts.hubId,
      task: next,
      taskId: nextId,
      bankNumber: opts.bankNumber,
      catalogNumber: opts.catalogNumber,
      part: opts.part,
      submitConfig: opts.submitConfig,
    });
  }
  return planHubHref({
    skill: opts.skill,
    hubId: opts.hubId,
    task: next,
    taskId: nextId,
  });
}

/** Resolve a Today checklist task to its fastest open URL (skip hub for practice). */
export function resolveTodayTaskHref(opts: {
  skill: string | null | undefined;
  hubId: string | null | undefined;
  taskType: string | null | undefined;
  taskId: string;
  fallbackHref?: string | null;
  bankNumber?: number;
  catalogNumber?: number | null;
  part?: number | null;
  submitConfig?: ModuleTargetConfig | null;
}): string {
  const skill = opts.skill;
  const hubId = opts.hubId;
  const task =
    opts.taskType === "watch" ||
    opts.taskType === "practice" ||
    opts.taskType === "submit"
      ? opts.taskType
      : null;
  if (!hubId || !skill || !task) {
    const fb = opts.fallbackHref;
    if (fb && !fb.includes("/content-library")) {
      return fb;
    }
    return "/study-plan/today";
  }
  if (
    skill !== "listening" &&
    skill !== "reading" &&
    skill !== "writing" &&
    skill !== "speaking"
  ) {
    const fb = opts.fallbackHref;
    if (fb && !fb.includes("/content-library")) {
      return fb;
    }
    return "/study-plan/today";
  }
  // Legacy Watch tasks open Practice (no video step in FSP plans).
  if (task === "watch") {
    const practiceTaskId = swapPlanTaskId(opts.taskId, "practice") ?? opts.taskId;
    if (isBankSubmitConfig(opts.submitConfig)) {
      return planExerciseHref({
        skill,
        hubId,
        task: "practice",
        taskId: practiceTaskId,
      });
    }
    if (opts.fallbackHref && opts.fallbackHref.includes("/test/")) {
      return opts.fallbackHref.replace(/task=watch/, "task=practice");
    }
    return planStepOpenHref({
      skill,
      hubId,
      task: "practice",
      taskId: practiceTaskId,
      bankNumber: opts.bankNumber ?? 1,
      catalogNumber: opts.catalogNumber,
      part: opts.part,
      submitConfig: opts.submitConfig,
    });
  }
  if (isBankSubmitConfig(opts.submitConfig)) {
    return planExerciseHref({
      skill,
      hubId,
      task,
      taskId: opts.taskId,
    });
  }
  // Backend serve-time rewrite is hub-aware — prefer it for Practice/Submit.
  if (opts.fallbackHref && opts.fallbackHref.includes("/test/")) {
    return opts.fallbackHref;
  }
  return planStepOpenHref({
    skill,
    hubId,
    task,
    taskId: opts.taskId,
    bankNumber: opts.bankNumber ?? 1,
    catalogNumber: opts.catalogNumber,
    part: opts.part,
    submitConfig: opts.submitConfig,
  });
}
