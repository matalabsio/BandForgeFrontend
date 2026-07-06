import { CheckCircle2, Lightbulb } from "lucide-react";
import type { WritingTaskReview } from "@/lib/module-review-types";

const CRITERIA: { key: string; label: string }[] = [
  { key: "task_achievement", label: "Task Achievement" },
  { key: "coherence", label: "Coherence & Cohesion" },
  { key: "lexical_resource", label: "Lexical Resource" },
  { key: "grammar", label: "Grammar Range & Acc." },
];

function FeedbackBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  if (items.length === 0) return null;
  const good = tone === "good";
  return (
    <div
      className={`rounded-[14px] border p-4 ${
        good
          ? "border-[#D6F0E2] border-l-[3px] border-l-[#10B981] bg-[#F4FBF7]"
          : "border-[#F8E6BE] border-l-[3px] border-l-[#F59E0B] bg-[#FEF8EC]"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        {good ? (
          <CheckCircle2 className="size-[17px] shrink-0 text-[#10B981]" strokeWidth={2.4} aria-hidden />
        ) : (
          <Lightbulb className="size-[17px] shrink-0 text-[#D98309]" strokeWidth={2.2} aria-hidden />
        )}
        <h4 className="font-display text-[15px] font-bold text-navy">{title}</h4>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2.5 font-sans text-[13.5px] leading-snug font-light text-[#334155]"
          >
            <span className={`shrink-0 font-semibold ${good ? "text-[#10B981]" : "text-[#D98309]"}`}>
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WritingTaskReviewCard({ task }: { task: WritingTaskReview }) {
  const essayParagraphs = task.essay
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E3E9F1] bg-white shadow-[0_8px_28px_rgba(13,31,60,0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#EDF1F6] px-5 py-4">
        <div className="min-w-0">
          <h3 className="font-display text-[16px] font-bold tracking-tight text-navy">
            Writing Task {task.part}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-[#94A3B8]">
            {task.word_count} words
          </p>
        </div>
        {task.ai_band != null ? (
          <div className="shrink-0 text-right">
            <div className="font-mono text-[26px] leading-none font-medium text-cyan">
              {task.ai_band.toFixed(1)}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wide text-[#94A3B8]">
              AI band
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-5 px-5 py-5">
        {task.prompt ? (
          <p className="break-words rounded-[12px] bg-[#F8FAFC] px-4 py-3 font-sans text-[13.5px] leading-relaxed text-[#475569]">
            {task.prompt}
          </p>
        ) : null}

        {Object.keys(task.criteria).length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {CRITERIA.map(({ key, label }) => (
              <div
                key={key}
                className="rounded-[14px] border border-[#EEF2F7] bg-white px-3 py-3.5 text-center"
              >
                <div className="font-mono text-[24px] leading-none font-medium text-cyan">
                  {(task.criteria[key] ?? 0).toFixed(1)}
                </div>
                <div className="mt-2 font-sans text-xs font-medium leading-snug text-[#0D1F3C]">
                  {label}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <FeedbackBlock title="Strengths" items={task.strengths} tone="good" />
          <FeedbackBlock title="To Improve" items={task.improvements} tone="warn" />
        </div>

        {essayParagraphs.length > 0 ? (
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#94A3B8]">
              Your essay
            </div>
            <div className="overflow-x-hidden rounded-[14px] border border-[#EEF2F7] bg-[#F8FAFC] p-4">
              <div className="font-sans text-[13.5px] leading-[1.8] font-light break-words text-[#334155]">
                {essayParagraphs.map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph.slice(0, 24)}`}
                    className={index < essayParagraphs.length - 1 ? "mb-3" : "m-0"}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
