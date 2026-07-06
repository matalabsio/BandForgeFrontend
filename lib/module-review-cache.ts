/** Cache a module review payload so the review page paints instantly after submit. */

import type { ModuleReviewPayload, ObjectiveModule } from "@/lib/module-review-types";

const key = (mockAttemptId: string, module: string) =>
  `bf-module-review-${mockAttemptId}-${module}`;

export function cacheModuleReview(
  mockAttemptId: string,
  module: ObjectiveModule,
  payload: ModuleReviewPayload,
): void {
  try {
    sessionStorage.setItem(key(mockAttemptId, module), JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readModuleReview(
  mockAttemptId: string,
  module: ObjectiveModule,
): ModuleReviewPayload | null {
  try {
    const raw = sessionStorage.getItem(key(mockAttemptId, module));
    if (!raw) return null;
    return JSON.parse(raw) as ModuleReviewPayload;
  } catch {
    return null;
  }
}

export function clearModuleReview(
  mockAttemptId: string,
  module: ObjectiveModule,
): void {
  try {
    sessionStorage.removeItem(key(mockAttemptId, module));
  } catch {
    /* ignore */
  }
}
