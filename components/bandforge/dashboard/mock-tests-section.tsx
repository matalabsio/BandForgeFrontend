import { FullMockCard } from "@/components/bandforge/dashboard/full-mock-card";
import { dashboardMockSummary } from "@/lib/dashboard-mock-fallback";
import {
  PUBLISHED_MOCK_SLUGS,
  getMockMeta,
  type MockSlug,
} from "@/lib/mock-catalog";
import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";
import type { MockTestSummary } from "@/components/bandforge/dashboard/types";

type Props = {
  mockTests: MockTestSummary[];
  initialMockProgressById?: Partial<Record<string, MockAttemptProgress | null>>;
};

export function MockTestsSection({
  mockTests,
  initialMockProgressById = {},
}: Props) {
  return (
    <section className="space-y-4" aria-labelledby="dashboard-mock-tests-heading">
      <div>
        <h2
          id="dashboard-mock-tests-heading"
          className="font-display text-lg font-bold text-[#0F172A]"
        >
          Full mock tests
        </h2>
        <p className="mt-1 text-[13px] text-[#0F172A]/55">
          Test 1 and Test 2 are live. Each card opens that mock on the test page.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {PUBLISHED_MOCK_SLUGS.map((slug: MockSlug) => {
          const meta = getMockMeta(slug);
          const summary = dashboardMockSummary(slug, mockTests);
          return (
            <FullMockCard
              key={slug}
              mockSlug={slug}
              title={summary.title}
              description={summary.description}
              initialProgress={initialMockProgressById[meta.id] ?? null}
            />
          );
        })}
      </div>
    </section>
  );
}
