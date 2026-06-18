"use client";

import Link from "next/link";
import { DEFAULT_MOCK_SLUG, mockModulePath } from "@/lib/mock-catalog";
import { writingTaskPath } from "@/lib/writing-test";
import { READING_PASSAGE_STAGES } from "@/modules/reading/reading-test-passages";
import { WRITING_TASK_STAGES } from "@/modules/writing/writing-test-tasks";
import { DashboardCard } from "@/components/bandforge/dashboard/dashboard-card";
import { cn } from "@/lib/utils";

type SectionItem = {
  key: string;
  module: "reading" | "writing";
  label: string;
  title: string;
  description: string;
  meta: string;
  href: string;
  live: boolean;
};

function buildSections(): SectionItem[] {
  const reading: SectionItem[] = READING_PASSAGE_STAGES.filter((p) => p.live).map(
    (p) => ({
      key: `reading-${p.passage}`,
      module: "reading" as const,
      label: p.title,
      title: p.context,
      description: p.description,
      meta: `${p.questionRange} · ${p.durationMinutes} min`,
      href: mockModulePath(DEFAULT_MOCK_SLUG, "reading", {
        passage: p.passage,
        auto: true,
      }),
      live: p.live,
    }),
  );

  const writing: SectionItem[] = WRITING_TASK_STAGES.filter((t) => t.live).map(
    (t) => ({
      key: `writing-${t.part}`,
      module: "writing" as const,
      label: t.title,
      title: t.examinerTitle ?? t.subtitle,
      description: `Minimum ${t.minWords} words`,
      meta: `${t.minutes} min`,
      href: writingTaskPath(t.part, { auto: true }),
      live: t.live,
    }),
  );

  return [...reading, ...writing];
}

export function PracticeSectionsCard() {
  const sections = buildSections();

  return (
    <DashboardCard>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">
        Practice sections
      </p>
      <h2 className="mt-2 font-display text-lg font-bold text-ink">
        Reading &amp; Writing
      </h2>
      <p className="mt-1 text-[13px] text-ink/55">
        Open any section directly. Writing has two tasks; reading passages use the
        3-phase exam flow (intro → passage → questions).
      </p>

      <ul className="mt-5 space-y-3">
        {sections.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className={cn(
                "block rounded-xl border border-ink/10 bg-surface p-4 transition-colors",
                "hover:border-cyan/40 hover:bg-white",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-cyan">
                    {item.module === "reading" ? "Reading" : "Writing"} · {item.label}
                  </p>
                  <p className="mt-1 font-display text-[15px] font-bold leading-snug text-ink">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
                    {item.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-bold text-teal">
                  {item.meta}
                </span>
              </div>
              <p className="mt-2 text-[12px] font-bold text-cyan">Open section →</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-[12px] text-ink/45">
        <Link href="/test/writing" className="font-medium text-cyan hover:underline">
          All writing tasks
        </Link>
      </p>
    </DashboardCard>
  );
}
