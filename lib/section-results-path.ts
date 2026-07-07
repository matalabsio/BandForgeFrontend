import type { ResultModule } from "@/lib/exam-session-storage";

export type SectionResultsModule = ResultModule;

export type SectionResultsPathOpts = {
  attempt: string;
  part?: number;
  mockAttempt?: string | null;
};

/** Canonical per-section results URL inside a mock or practice attempt. */
export function shortSectionResultsPath(
  testNumber: number,
  module: SectionResultsModule,
  opts: SectionResultsPathOpts,
): string {
  const params = new URLSearchParams({ attempt: opts.attempt });
  if (opts.part != null && Number.isFinite(opts.part)) {
    params.set("part", String(opts.part));
  }
  if (opts.mockAttempt) {
    params.set("mock_attempt", opts.mockAttempt);
  }
  return `/test/${testNumber}/${module}/results?${params.toString()}`;
}

export function isMockSectionResultsUrl(searchParams: URLSearchParams): boolean {
  return Boolean(
    searchParams.get("mock_attempt")?.trim() && searchParams.get("attempt")?.trim(),
  );
}
