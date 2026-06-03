import type { WritingTask } from "@/modules/writing/types";
import { WritingTaskPromptHeader } from "@/modules/writing/components/writing-task-prompt-header";

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
};

export function WritingTask2Prompt({
  task,
  minutes = 40,
  minWords = 250,
}: Props) {
  const parsed = parseTask2Prompt(task.prompt);

  return (
    <div className="space-y-4">
      <WritingTaskPromptHeader
        part={2}
        options={task.options}
        minutes={minutes}
        minWords={minWords}
      />

      {parsed.intro ? (
        <p className="text-question leading-relaxed text-ink">{parsed.intro}</p>
      ) : null}

      {parsed.question ? (
        <blockquote
          className="rounded-lg border-l-4 border-teal bg-teal/5 px-4 py-3 text-question font-semibold leading-relaxed text-navy"
          cite="task"
        >
          {parsed.question}
        </blockquote>
      ) : (
        <p className="text-question leading-relaxed text-ink" data-test-question>
          {task.prompt}
        </p>
      )}

      {parsed.requirements ? (
        <p className="text-body leading-relaxed text-ink/80">{parsed.requirements}</p>
      ) : null}

      <aside className="rounded-lg border border-border bg-surface p-4">
        <p className="text-meta font-semibold text-navy">Essay checklist</p>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-meta text-ink/65">
          <li>State your position clearly in the introduction</li>
          <li>Develop 2–3 body paragraphs with reasons and examples</li>
          <li>Address the other view briefly if relevant</li>
          <li>Conclude by restating your opinion</li>
          <li>Leave time to proofread grammar and linking words</li>
        </ul>
      </aside>
    </div>
  );
}
