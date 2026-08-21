/**
 * Writing Skill track entry helpers (usage.exam_module via practice hubs probe).
 * Keep logic mirrored in writing-skill-track.test.mjs.
 */

import { ApiError } from "@/lib/api";
import {
  getPracticeHubs,
  isExamModuleRequiredError,
  setWritingSkillExamModule,
  type WritingSkillExamModule,
} from "@/lib/practice-api";
import {
  WRITING_PRACTICE_PATH,
  WRITING_SKILL_ONBOARDING_PATH,
} from "@/lib/entitlement";

export type WritingSkillTrackState =
  | "needs_track"
  | "ready"
  | "forbidden"
  | "error";

export async function probeWritingSkillTrackState(): Promise<WritingSkillTrackState> {
  try {
    await getPracticeHubs("writing");
    return "ready";
  } catch (error) {
    if (isExamModuleRequiredError(error)) return "needs_track";
    if (error instanceof ApiError && error.status === 403) return "forbidden";
    return "error";
  }
}

/**
 * Resolve where a Writing Skill user should land.
 * Does not use users.exam_module — only the practice hubs probe (usage track).
 */
export async function resolveWritingSkillEntryPath(): Promise<string> {
  const state = await probeWritingSkillTrackState();
  if (state === "ready") return WRITING_PRACTICE_PATH;
  if (state === "needs_track") return WRITING_SKILL_ONBOARDING_PATH;
  if (state === "forbidden") return "/pricing";
  return WRITING_SKILL_ONBOARDING_PATH;
}

export async function selectWritingSkillTrack(
  examModule: WritingSkillExamModule,
): Promise<{ path: string; changed: boolean }> {
  try {
    const result = await setWritingSkillExamModule(examModule);
    return { path: WRITING_PRACTICE_PATH, changed: result.changed };
  } catch (error) {
    // Track already locked to a different value — do not overwrite; route by probe.
    if (error instanceof ApiError && error.status === 409) {
      const path = await resolveWritingSkillEntryPath();
      return { path, changed: false };
    }
    throw error;
  }
}

export { WRITING_PRACTICE_PATH, WRITING_SKILL_ONBOARDING_PATH };
