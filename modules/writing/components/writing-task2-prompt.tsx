import type { WritingTask } from "@/modules/writing/types";
import { WritingTaskPromptHeader } from "@/modules/writing/components/writing-task-prompt-header";
import { RichText } from "@/components/rich-text";

type ParsedPrompt = {
  intro: string;
  question: string;
  requirements: string;
};

/** Split stored prompt into intro, opinion question, and trailing requirements. */
export function parseTask2Prompt(raw: string): ParsedPrompt {
  const extentIdx = raw.search(/To what extent/i);
  const giveIdx = raw.search(/Give reasons for your answer/i);

  if (extentIdx >= 0 && giveIdx > extentIdx) {
    return {
      intro: raw.slice(0, extentIdx).trim(),
      question: raw.slice(extentIdx, giveIdx).trim(),
      requirements: raw.slice(giveIdx).trim(),
    };
  }

  if (extentIdx >= 0) {
    return {
      intro: raw.slice(0, extentIdx).trim(),
      question: raw.slice(extentIdx).trim(),
      requirements: "",
    };
  }

  return { intro: raw.trim(), question: "", requirements: "" };
}

type Props = {
  task: WritingTask;
  minutes?: number;
  minWords?: number;
  showChecklist?: boolean;
  plainHeader?: boolean;
};

export function WritingTask2Prompt({
  task,
  minutes = 40,
  minWords = 250,
  showChecklist = true,
  plainHeader = false,
}: Props) {
  const parsed = parseTask2Prompt(task.prompt);

  return (
    <div className="space-y-4">
      <WritingTaskPromptHeader
        part={2}
        options={task.options}
        minutes={minutes}
        minWords={minWords}
        plainHeader={plainHeader}
      />

      {parsed.intro ? (
        <p className="text-[15px] leading-relaxed text-[#334155]">
          <RichText text={parsed.intro} />
        </p>
      ) : null}

      {parsed.question ? (
        <blockquote
          className="rounded-xl border border-[#A5F3FC] border-l-4 border-l-cyan bg-[#ECFEFF]/60 px-4 py-3 text-[15px] font-semibold leading-relaxed text-ink"
          cite="task"
        >
          <RichText text={parsed.question} />
        </blockquote>
      ) : (
        <p className="text-question leading-relaxed text-ink" data-test-question>
          <RichText text={task.prompt} />
        </p>
      )}

      {parsed.requirements ? (
        <p className="text-[14px] leading-relaxed text-[#475569]">
          <RichText text={parsed.requirements} />
        </p>
      ) : null}

      {showChecklist ? (
      <aside className="rounded-xl border border-[#E2E8F0] bg-surface p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
          Essay checklist
        </p>
        <ul className="mt-2.5 space-y-2 text-[13px] leading-snug text-[#475569]">
          <li className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-cyan" aria-hidden />
            State your position clearly in the introduction
          </li>
          <li className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-cyan" aria-hidden />
            Develop 2–3 body paragraphs with reasons and examples
          </li>
          <li className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-cyan" aria-hidden />
            Address the other view briefly if relevant
          </li>
          <li className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-cyan" aria-hidden />
            Conclude by restating your opinion
          </li>
          <li className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-cyan" aria-hidden />
            Leave time to proofread grammar and linking words
          </li>
        </ul>
      </aside>
      ) : null}
    </div>
  );
}
