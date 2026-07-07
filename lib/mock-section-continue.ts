import {
  canonicalMockSlug,
  getMockMeta,
  mockTestIdForNumber,
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
};

export type MockSectionContinue = {
  path: string;
  label: string;
};

function metaForTest(testNumber: number) {
  const mockTestId = mockTestIdForNumber(testNumber);
  const slug = canonicalMockSlug(mockTestId);
  return getMockMeta(slug);
}

/** Next exam step after a per-section results screen (mock flow). */
export function getMockSectionContinue(ctx: MockSectionContext): MockSectionContinue {
  const meta = metaForTest(ctx.testNumber);
  const { mockAttemptId } = ctx;

  if (ctx.module === "listening") {
    if (ctx.part < meta.listeningPartCount) {
      return {
        path: shortModuleExamPath(ctx.testNumber, "listening", { part: ctx.part + 1 }),
        label: "Continue to Next Section",
      };
    }
    return {
      path: shortModuleExamPath(ctx.testNumber, "reading", { passage: 1 }),
      label: "Continue to Reading",
    };
  }

  if (ctx.module === "reading") {
    if (ctx.part < meta.readingPassageCount) {
      return {
        path: shortModuleExamPath(ctx.testNumber, "reading", {
          passage: ctx.part + 1,
        }),
        label: "Continue to Next Section",
      };
    }
    return {
      path: shortModuleExamPath(ctx.testNumber, "writing", { part: 1 }),
      label: "Continue to Writing",
    };
  }

  if (ctx.module === "writing") {
    if (ctx.part < meta.writingTaskCount) {
      return {
        path: shortModuleExamPath(ctx.testNumber, "writing", { part: ctx.part + 1 }),
        label: "Continue to Next Section",
      };
    }
    if (ctx.testNumber === 1) {
      return {
        path: shortModuleExamPath(ctx.testNumber, "speaking"),
        label: "Continue to Speaking",
      };
    }
    return {
      path: mockResultsPathForTest(ctx.testNumber, mockAttemptId),
      label: "Finish Test",
    };
  }

  return {
    path: mockResultsPathForTest(ctx.testNumber, mockAttemptId),
    label: "Finish Test",
  };
}

/** Slug-based path helper for submit handlers that already have slugOrId. */
export function sectionResultsPathForMockSubmit(
  slugOrId: string,
  module: MockSectionContext["module"],
  opts: { attempt: string; part: number; mockAttemptId?: string },
): string {
  const testNumber = testNumberForMockId(slugOrId);
  return shortSectionResultsPath(testNumber, module, {
    attempt: opts.attempt,
    part: opts.part,
    mockAttempt: opts.mockAttemptId,
  });
}
