/** Performance / score reports routes. */

function scoresPath(opts?: {
  attempt?: string;
  /** Show post-mock completion banner and scroll to latest report. */
  fresh?: boolean;
}): string {
  const params = new URLSearchParams();
  if (opts?.attempt) params.set("attempt", opts.attempt);
  if (opts?.fresh) params.set("fresh", "1");
  const q = params.toString();
  return q ? `/scores?${q}` : "/scores";
}

/** After finishing the last section of a full mock (e.g. Test 1 listening). */
export function scoresAfterMockCompletePath(latestAttemptId: string): string {
  return scoresPath({ attempt: latestAttemptId, fresh: true });
}
