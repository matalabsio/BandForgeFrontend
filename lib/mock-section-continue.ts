import {
  getMockMeta,
  shortModuleExamPath,
  testNumberForMockId,
} from "@/lib/mock-catalog";
import { mockResultsPathForTest } from "@/lib/module-review-paths";
import { shortSectionResultsPath } from "@/lib/section-results-path";

export type MockSectionContext = {
  testNumber: number;
  mockAttemptId: string;
  module: "listening" | "reading" | "writing" | "speaking";
  /** Listening part, reading passage, or writing task number. */
  part: number;
  /** Admin catalog mock UUID — prefer this for section counts over static Test 1 meta. */
  mockTestId?: string;
  listeningPartCount?: number;
  readingPassageCount?: number;
  writingTaskCount?: number;
  speakingMinutes?: number;
};

export type MockSectionContinue = {
  path: string;
  label: string;
};

function sectionCounts(ctx: MockSectionContext) {
  const meta = ctx.mockTestId
    ? getMockMeta(ctx.mockTestId)
    : getMockMeta(ctx.testNumber === 2 ? "m02" : "m01");

  return {
    listeningPartCount: ctx.listeningPartCount ?? meta.listeningPartCount,
    readingPassageCount: ctx.readingPassageCount ?? meta.readingPassageCount,
    writingTaskCount: ctx.writingTaskCount ?? meta.writingTaskCount,
    speakingMinutes: ctx.speakingMinutes ?? meta.speakingMinutes ?? 0,
  };
}

/** Next exam step after a per-section results screen (mock flow). */
export function getMockSectionContinue(ctx: MockSectionContext): MockSectionContinue {
  const counts = sectionCounts(ctx);
  const { mockAttemptId, testNumber } = ctx;

  if (ctx.module === "listening") {
    if (ctx.part < counts.listeningPartCount) {
      return {
        path: shortModuleExamPath(testNumber, "listening", { part: ctx.part + 1 }),
        label: "Continue to Next Section",
      };
    }
    return {
      path: shortModuleExamPath(testNumber, "reading", { passage: 1 }),
      label: "Continue to Reading",
    };
  }

  if (ctx.module === "reading") {
    if (ctx.part < counts.readingPassageCount) {
      return {
        path: shortModuleExamPath(testNumber, "reading", {
          passage: ctx.part + 1,
        }),
        label: "Continue to Next Section",
      };
    }
    return {
      path: shortModuleExamPath(testNumber, "writing", { part: 1 }),
      label: "Continue to Writing",
    };
  }

  if (ctx.module === "writing") {
    if (ctx.part < counts.writingTaskCount) {
      return {
        path: shortModuleExamPath(testNumber, "writing", { part: ctx.part + 1 }),
        label: "Continue to Next Section",
      };
    }
    if (counts.speakingMinutes > 0) {
      return {
        path: shortModuleExamPath(testNumber, "speaking"),
        label: "Continue to Speaking",
      };
    }
    return {
      path: mockResultsPathForTest(testNumber, mockAttemptId),
      label: "Finish Test",
    };
  }

  // speaking
  return {
    path: mockResultsPathForTest(testNumber, mockAttemptId),
    label: "Finish Test",
  };
}

/** Slug-based path helper for submit handlers that already have slugOrId. */
export function sectionResultsPathForMockSubmit(
  slugOrId: string,
  module: MockSectionContext["module"],
  opts: {
    attempt: string;
    part: number;
    mockAttemptId?: string;
    /** Catalog slot number — required for admin mocks (UUID ≠ m01/m02). */
    testNumber?: number;
  },
): string {
  const testNumber = opts.testNumber ?? testNumberForMockId(slugOrId);
  return shortSectionResultsPath(testNumber, module, {
    attempt: opts.attempt,
    part: opts.part,
    mockAttempt: opts.mockAttemptId,
  });
}
